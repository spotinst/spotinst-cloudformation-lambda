var handler  = require('lambda-formation').resource.update;
var util     = require('lambda-formation').util;
var request  = require('request');
var _        = require('lodash');
var spotUtil = require('../../util');
var asgLib   = require('./lib/core');


/**
 * This function updated an elastigroup 
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
  if(err) {
    return util.done(err);
  }
  
  spotUtil.getTokenAndConfig(event, function(err, tc) {
    if(err) {
      return util.done(err, event, context);
    }

    let updatePolicy = spotUtil.getUpdatePolicyConfig(event) || {};
    let refId        = event.id || event.PhysicalResourceId;

    spotUtil.updateGroup({
      event        : event, 
      context      : context, 
      updatePolicy : updatePolicy, 
      refId        : refId, 
      token        : tc.token, 
      body         : asgLib.getGroupConfig(event)})

  });
}

/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, update]);
};

