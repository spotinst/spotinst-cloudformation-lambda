var handler  = require('lambda-formation').resource.update;
var util     = require('lambda-formation').util;
var request  = require('request');
var _        = require('lodash');
var spotUtil = require('../../util');

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
    let groupConfig  = spotUtil.parseGroupConfig(tc.config);
    
    _.unset(groupConfig, 'compute.product');
    _.unset(groupConfig, 'capacity.unit');
    
    let shouldUpdateTargetCapacity = spotUtil.parseBoolean(updatePolicy.shouldUpdateTargetCapacity);
    
    if(shouldUpdateTargetCapacity === false) {
      _.unset(groupConfig, 'capacity.target');
    }
    
    spotUtil.updateGroup({
      event        : event, 
      context      : context, 
      updatePolicy : updatePolicy, 
      refId        : refId, 
      tc           : tc, 
      body         : groupConfig
    })
  })
}



/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, update]);
};


