"use strict";

let handler = require('lambda-formation').resource.create;
let util = require('lambda-formation').util;
let request = require('request');
let spotUtil = require('../../util');
let _ = require('lodash');


/**
 * This function creates a stateful node based on the CF template
 *
 * @function
 * @name create
 *
 * @param {Object} err - Err data from Lambda
 * @param {Object} event - Event data from Lambda
 * @param {Object} context - Context data from Lambda
 */
function create(err, event, context) {
    spotUtil.getTokenAndConfig(event, function (err, tc) {
        if (err) {
            return util.done(err, event, context);
        }

        let statefulNodeConfig = tc.config;

        if (spotUtil.checkAutoTag(event)) {
            let autoTags = spotUtil.generateTags(event)

            if (spotUtil.tagsExsist(statefulNodeConfig)) {
                autoTags.forEach((singleTag) => {
                    statefulNodeConfig.compute.launchSpecification.tags.push(singleTag)
                })
            } else {
                statefulNodeConfig.compute.launchSpecification.tags = autoTags
            }
        }

        let createStatefulNodeOptions = {
            uri: "https://api.spotinst.io/aws/ec2/managedInstance",
            method: "POST",
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
                managedInstance: statefulNodeConfig
            }
        }

        console.log('Creating Stateful Node: ' + JSON.stringify(statefulNodeConfig, null, 2))

        request(createStatefulNodeOptions, function (err, res, body) {
            spotUtil.validateResponse({
                err: err,
                res: res,
                body: body,
                event: event,
                context: context,
                resource: 'statefulNode',
                action: 'create',
                successCb: function () {
                    console.log('Stateful Node Creation Success: ' + JSON.stringify(body, null, 2));

                    let physicalResourceId = body.response.items[0].id

                    let options = {
                        cfn_responder: {
                            returnError: false,
                            logLevel: "debug"
                        }
                    };

                    util.done(null, event, context, null, physicalResourceId, options);
                },
                failureCb: function() {
                    let errMsg = res.body.response.errors[0].message
                    console.log("Can't create Stateful Node, error: " + errMsg);
                }
            })
        })
    })
}


/* Do not change this function */
module.exports.handler = function (event, context) {
    handler.apply(this, [event, context, create]);
};

