"use strict";

let handler = require('lambda-formation').resource.create;
let util = require('lambda-formation').util;
let request = require('request');
let spotUtil = require('../../util');
let _ = require('lodash');

/**
 * This function updates a stateful node
 *
 * @function
 * @name update
 *
 * @param {Object} err - Err data from Lambda
 * @param {Object} event - Event data from Lambda
 * @param {Object} context - Context data from Lambda
 *
 * @property {String} asg name string
 */
function update(err, event, context) {
    const refId = event.id || event.PhysicalResourceId;

    if (spotUtil.shouldIgnoreCredentialsChange(event)) {
        return spotUtil.done(null, event, context, null, refId);
    }

    spotUtil.getTokenAndConfig(event, function (err, tc) {
        if (err) {
            return util.done(err, event, context);
        }

        let statefulNodeUpdateConfig = tc.config;

        _.unset(statefulNodeUpdateConfig, 'region')
        _.unset(statefulNodeUpdateConfig, 'compute.product');

        if (spotUtil.checkAutoTag(event)) {
            let autoTags = spotUtil.generateTags(event)
            if (spotUtil.tagsExsist(statefulNodeUpdateConfig)) {
                autoTags.forEach((singleTag) => {
                    statefulNodeUpdateConfig.compute.launchSpecification.tags.push(singleTag)
                })
            } else {
                statefulNodeUpdateConfig.compute.launchSpecification.tags = autoTags
            }
        }

        let updateStatefulNodeOptions = {
            uri: "https://api.spotinst.io/aws/ec2/managedInstance/" + refId,
            method: "PUT",
            qs: {
                accountId: spotUtil.getAccountId(event),
                ...spotUtil.getParameters(event),
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + tc.token,
                'User-Agent': spotUtil.getUserAgent()
            },
            json: {
                managedInstance: statefulNodeUpdateConfig
            }
        }

        console.log('Update Stateful Node: ' + JSON.stringify(statefulNodeUpdateConfig, null, 2))

        request(updateStatefulNodeOptions, function (err, res, body) {
            spotUtil.validateResponse({
                err: err,
                res: res,
                body: body,
                event: event,
                context: context,
                resource: 'statefulNode',
                action: 'update',
                successCb: function () {
                    let updatePolicy = spotUtil.getUpdatePolicyConfig(event) || {};
                    let shouldRecycle = spotUtil.parseBoolean(updatePolicy.shouldRecycle); // TODO Tamir - consult with product?

                    if (shouldRecycle) {
                        spotUtil.recycleStatefulNode({
                            event: event,
                            context: context,
                            refId: refId,
                            token: tc.token
                        });
                    } else {
                        console.log('Stateful Node Update Success: ' + JSON.stringify(body, null, 2));

                        let options = {
                            cfn_responder: {
                                returnError: false,
                                logLevel: "debug"
                            }
                        };

                        util.done(null, event, context, null, refId, options);
                    }
                }
            })
        })
    })
}


/* Do not change this function */
module.exports.handler = function (event, context) {
    handler.apply(this, [event, context, update]);
};

