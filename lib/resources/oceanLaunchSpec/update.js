"use strict";

var handler  = require('lambda-formation').resource.create;
var util     = require('lambda-formation').util;
var request  = require('request');
var spotUtil = require('../../util');
var _        = require('lodash');

/**
 * This function updates an ocean launch spec
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

    let oceanUpdateConfig = tc.config

    _.unset(oceanUpdateConfig, 'oceanId');

    let updateOceanOptions = {
      uri:     "https://api.spotinst.io/ocean/aws/k8s/launchSpec/" + refId,
      method:  "PUT",
      qs:      {
        accountId: spotUtil.getAccountId(event),
        ...spotUtil.getParameters(event),
      },
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + tc.token,
        'User-Agent':    spotUtil.getUserAgent()
      },
      json:    {
        launchSpec: oceanUpdateConfig
      }
    }

    console.log('Update ocean launchSpec: ' + JSON.stringify(oceanUpdateConfig, null, 2))

    request(updateOceanOptions, function (err, res, body) {
      spotUtil.validateResponse({
        err:       err,
        res:       res,
        body:      body,
        event:     event,
        context:   context,
        resource:  'ocean launch spec',
        action:    'update',
        successCb: function (spotResponse) {
          console.log('Ocean Launch Spec Update Success: ' + JSON.stringify(body, null, 2));

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
  })

}

/* Do not change this function */
module.exports.handler = function (event, context) {
  handler.apply(this, [event, context, update]);
};
