"use strict";

let handler  = require('lambda-formation').resource.create;
let util     = require('lambda-formation').util;
let request  = require('request');
let spotUtil = require('../../util');
let _        = require('lodash');

/**
 * This function updates an ocean cluster
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

    let oceanUpdateConfig = tc.config;

    _.unset(oceanUpdateConfig, 'region');

    let updatePolicy               = spotUtil.getUpdatePolicyConfig(event) || {};
    let shouldUpdateTargetCapacity = spotUtil.parseBoolean(updatePolicy.shouldUpdateTargetCapacity);

    if (shouldUpdateTargetCapacity === false) {
      _.unset(oceanUpdateConfig, 'capacity.target');
    }

    let updateOceanOptions = {
      uri:     "https://api.spotinst.io/ocean/aws/ecs/cluster/" + refId,
      method:  "PUT",
      qs:      {
        accountId: spotUtil.getSpotinstAccountId(event),
      },
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + tc.token,
        'User-Agent':    spotUtil.getUserAgent()
      },
      json:    {
        cluster: oceanUpdateConfig
      }
    };

    console.log('Update ocean ECS cluster: ' + JSON.stringify(oceanUpdateConfig, null, 2))

    request(updateOceanOptions, function (err, res, body) {
      spotUtil.validateResponse({
        err:       err,
        res:       res,
        body:      body,
        event:     event,
        context:   context,
        resource:  'oceanEcs',
        action:    'update',
        successCb: function (spotResponse) {
          console.log('Ocean ECS Update Success: ' + JSON.stringify(body, null, 2));

          let options = {
            cfn_responder: {
              returnError: false,
              logLevel:    "debug"
            }
          };

          util.done(null, event, context, null, refId, options);
        }
      })
    })

    let shouldRoll = spotUtil.parseBoolean(updatePolicy.shouldRoll);
    if (shouldRoll === true) {

      spotUtil.rollCluster({
        event:        event,
        context:      context,
        updatePolicy: updatePolicy,
        refId:        refId,
        token:        tc.token,
        body:         updatePolicy.rollConfig
      })
    }
  })
}

/* Do not change this function */
module.exports.handler = function (event, context) {
  handler.apply(this, [event, context, update]);
};

