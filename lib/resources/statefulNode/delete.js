"use strict";

let handler = require('lambda-formation').resource.create;
let util = require('lambda-formation').util;
let request = require('request');
let spotUtil = require('../../util');
let _ = require('lodash');
let async = require('async')

/**
 * This function deletes a stateful node that was created from an existing CF template using the delete stateful node API call
 *
 * @function
 * @name destroy
 *
 * @param {Object} err - Err data from Lambda
 * @param {Object} event - Event data from Lambda
 * @param {Object} context - Context data from Lambda
 *
 * @property {String} asg name string
 */
let destroy = async function (err, event, context) {
    console.log('Delete Event: ' + JSON.stringify(event, null, 2));

    let token = await spotUtil.getTokenAsync({event: event, context: context})
        .catch((err) => {
            return util.done(err, event, context, {});
        })

    var refId = event.id || event.PhysicalResourceId;

    if (refId === "ResourceFailed") {
        console.log("rolling back")
        return util.done(null, event, context);
    }

    if (spotUtil.checkAutoTag(event)) {
        refId = await getStatefulNodeFromTags(event, token)
            .catch((err) => {
                console.log(err)
                return util.done(err, event, context, {});
            })
    }

    let deletePolicy = spotUtil.getDeletePolicyConfig(event) || {}

    let shouldDeleteImages = _.get(deletePolicy, 'deallocationConfig.shouldDeleteImages') || _.get(deletePolicy, 'shouldDeleteImages');
    let shouldDeleteNetworkInterfaces = _.get(deletePolicy, 'deallocationConfig.shouldDeleteNetworkInterfaces') || _.get(deletePolicy, 'shouldDeleteNetworkInterfaces');
    let shouldDeleteVolumes = _.get(deletePolicy, 'deallocationConfig.shouldDeleteVolumes') || _.get(deletePolicy, 'shouldDeleteVolumes');
    let shouldDeleteSnapshots = _.get(deletePolicy, 'deallocationConfig.shouldDeleteSnapshots') || _.get(deletePolicy, 'shouldDeleteSnapshots');
    let shouldTerminateInstance = _.get(deletePolicy, 'deallocationConfig.shouldTerminateInstance') || _.get(deletePolicy, 'shouldTerminateInstance');

    let shouldDeleteAmiBackupImages = _.get(deletePolicy, 'amiBackup.shouldDeleteImages');

    let statefulNodeDeleteOptions = {
        uri: "https://api.spotinst.io/aws/ec2/managedInstance/" + refId,
        method: "DELETE",
        qs: {
            accountId: spotUtil.getAccountId(event)
        },
        json: {
            deallocationConfig: {
                shouldDeleteImages: shouldDeleteImages,
                shouldDeleteNetworkInterfaces: shouldDeleteNetworkInterfaces,
                shouldDeleteVolumes: shouldDeleteVolumes,
                shouldDeleteSnapshots: shouldDeleteSnapshots,
                shouldTerminateInstance: shouldTerminateInstance
            },
            amiBackup: {
                shouldDeleteImages: shouldDeleteAmiBackupImages
            }
        },
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
            'User-Agent': spotUtil.getUserAgent()
        }
    }

    console.log(`Deleting Stateful Node ${refId}`)

    request(statefulNodeDeleteOptions, function (err, res, body) {
        spotUtil.validateResponse({
            err: err,
            res: res,
            body: body,
            event: event,
            context: context,
            resource: 'statefulNode',
            action: 'delete',
            successCb: function (spotResponse) {
                if (typeof body == "string") {
                    body = JSON.parse(body)
                }
                console.log("Delete Success: " + JSON.stringify(spotResponse, null, 2))
                util.done(null, event, context, body);
            },
            failureCb: function () {
                console.log("Can't delete stateful node, check if the stateful node even exists");
                spotUtil.validateStatefulNode(refId, token, event, context);
            }
        });
    });
}

/**
 * Gets a stateful node based on its tags if the auto tag flag is set to true
 *
 * @function
 * @name getStatefulNodeFromTags
 *
 * @param {Object} event - Event data from Lambda
 * @param {Object} token - token for spotinst api
 */
function getStatefulNodeFromTags(event, token) {
    return new Promise((resolve, reject) => {
        let autoTags = spotUtil.generateTags(event)

        console.log("AutoTags: " + JSON.stringify(autoTags, null, 2))
        let getAllStatefulNodeOptions = {
            url: "https://api.spotinst.io/aws/ec2/managedInstance",
            method: "GET",
            qs: {
                accountId: spotUtil.getAccountId(event),
                ...spotUtil.getParameters(event),
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
                'User-Agent': spotUtil.getUserAgent()
            }
        }

        console.log('Getting All Stateful Node: ' + JSON.stringify(getAllStatefulNodeOptions, null, 2));

        let getAllStatefulNodes = (cb) => {
            request(getAllStatefulNodeOptions, function (err, res, body) {
                spotUtil.validateResponse({
                    err: err,
                    res: res,
                    body: body,
                    event: event,
                    context: null,
                    resource: 'statefulNode',
                    action: 'get-all',
                    successCb: function () {
                        if (typeof body == "string") {
                            body = JSON.parse(body)
                        }
                        let groups = body.response.items

                        groups.forEach((singleGroup) => {
                            let tags = singleGroup.compute.launchSpecification.tags

                            if (_.find(tags, autoTags[0]) && _.find(tags, autoTags[1]) && _.find(tags, autoTags[2])) {
                                console.log("stateful node found from tags: " + singleGroup.id)
                                cb(null, singleGroup.id)
                            }
                        })

                        cb("stateful node not found from tags")
                    },
                    failureCb: function (spotResponse) {
                        cb(spotResponse.errMsg);
                    }
                })
            })
        }

        async.retry({times: 5, interval: 1000}, getAllStatefulNodes, (err, res) => {
            if (err) {
                return reject(err)
            } else {
                return resolve(res)
            }
        })
    })
}

/* Do not change this function */
module.exports.handler = function (event, context) {
    handler.apply(this, [event, context, destroy]);
};