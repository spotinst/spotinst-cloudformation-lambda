var handler  = require('lambda-formation').resource.update;
var util     = require('lambda-formation').util;
var request  = require('request');
var _        = require('lodash');
var spotUtil = require('../../util');
var asgLib   = require('./lib/core');

/**
 * This function creates an elastigroup from an exsisting ASG using the import ASG API call
 *
 * @function
 * @name getASGName
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
    
    let updatePolicy = getUpdatePolicyConfig(event) || {};
    
    let refId         = event.id || event.PhysicalResourceId;
    let updateOptions = {
      method:  'PUT',
      url:     'https://api.spotinst.io/aws/ec2/group/' + refId,
      qs:      {
        accountId:            spotUtil.getSpotinstAccountId(event),
        shouldResumeStateful: updatePolicy.shouldResumeStateful
      },
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': 'Bearer ' + tc.token,
        'User-Agent'   : spotUtil.getUserAgent()
      },
      json:    {
        group: asgLib.getGroupConfig(event)
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
          'Content-Type' : 'application/json',
          'Authorization': 'Bearer ' + tc.token,
          'User-Agent'   : spotUtil.getUserAgent()
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















