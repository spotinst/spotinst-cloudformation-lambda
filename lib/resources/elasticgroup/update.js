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
    
    let updatePolicy = getUpdatePolicyConfig(event) || {};
    let groupConfig  = spotUtil.parseGroupConfig(tc.config);
    
    _.unset(groupConfig, 'compute.product');
    _.unset(groupConfig, 'capacity.unit');
    
    let shouldUpdateTargetCapacity = spotUtil.parseBoolean(updatePolicy.shouldUpdateTargetCapacity);
    
    if(shouldUpdateTargetCapacity === false) {
      _.unset(groupConfig, 'capacity.target');
    }
    
    let refId         = event.id || event.PhysicalResourceId;
    let updateOptions = {
      method:  'PUT',
      url:     'https://api.spotinst.io/aws/ec2/group/' + refId,
      qs:      {
        accountId:            spotUtil.getSpotinstAccountId(event),
        shouldResumeStateful: updatePolicy.shouldResumeStateful
      },
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + tc.token
      },
      json:    {
        group: groupConfig
      }
    };
    
    let rollGroup = function() {
      let rollOptions = {
        method:  'PUT',
        url:     'https://api.spotinst.io/aws/ec2/group/' + refId + '/roll',
        qs:      {
          accountId: spotUtil.getSpotinstAccountId(event)
        },
        headers: {
          'Content-Type':  'application/json',
          'Authorization': 'Bearer ' + tc.token
        },
        json:    updatePolicy.rollConfig || {}
      };
      request(rollOptions, function(err, res, body) {
        spotUtil.validateResponse({
          err:       err,
          res:       res,
          body:      body,
          event:     event,
          context:   context,
          resource:  'roll',
          action:    'create',
          successCb: function(spotResponse) {
            let options = {
              cfn_responder: {
                returnError: false,
                logLevel:    "debug"
              }
            };
            util.done(err, event, context, {}, refId, options);
          }
        });
      });
    };
    
    console.log('Updating group ' + refId + ':' + JSON.stringify(groupConfig, null, 2));
    console.log('Update Policy config: ' + JSON.stringify(updatePolicy, null, 2));
    
    request(updateOptions, function(err, res, body) {
      spotUtil.validateResponse({
        err:       err,
        res:       res,
        body:      body,
        event:     event,
        context:   context,
        resource:  'elasticgroup',
        action:    'update',
        successCb: function(spotResponse) {
          let shouldRoll = spotUtil.parseBoolean(updatePolicy.shouldRoll);
          
          if(shouldRoll) {
            rollGroup();
          } else {
            let options = {
              cfn_responder: {
                returnError: false,
                logLevel:    "debug"
              }
            };
            util.done(err, event, context, {}, refId, options);
          }
        }
      });
    });
    
  });
}

function getUpdatePolicyConfig(event) {
  let updatePolicy = _.get(event, 'ResourceProperties.updatePolicy') || _.get(event, 'updatePolicy');
  return updatePolicy;
}

/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, update]);
};















