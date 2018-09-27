var _        = require('lodash');
var handler  = require('lambda-formation').resource.delete;
var util     = require('lambda-formation').util;
var request  = require('request');
var spotUtil = require('../../util');

/**
 * This function deletes an elastigroup that was created from an exsisting ASG using the delete elastigroup API call
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
var destroy = function(err, event, context) {
  if(err) {
    return util.done(err);
  }
  
  spotUtil.getToken(event, function(err, token) {
    if(err) return util.done(err, event, context);
  
    let deletePolicy = getDeletePolicyConfig(event) || {};
    
    let shouldDeleteImages            = spotUtil.parseBoolean(deletePolicy.shouldDeleteImages);
    let shouldDeleteNetworkInterfaces = spotUtil.parseBoolean(deletePolicy.shouldDeleteNetworkInterfaces);
    let shouldDeleteVolumes           = spotUtil.parseBoolean(deletePolicy.shouldDeleteVolumes);
    let shouldDeleteSnapshots         = spotUtil.parseBoolean(deletePolicy.shouldDeleteSnapshots);
    
    var refId = event.id || event.PhysicalResourceId;
    
    // Let CloudFormation rollbacks happen for failed stacks
    if(event.StackId && !_.startsWith(refId, 'sig'))
      return util.done(null, event, context);
    
    console.log('Deleting group: ' + refId);
    var deleteOptions = {
      method:  'DELETE',
      url:     'https://api.spotinst.io/aws/ec2/group/' + refId,
      qs:      {
        accountId: spotUtil.getSpotinstAccountId(event)
      },
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + token,
        'User-Agent'   : spotUtil.getUserAgent()
      },
      json:    {
        statefulDeallocation: {
          shouldDeleteImages:            shouldDeleteImages,
          shouldDeleteNetworkInterfaces: shouldDeleteNetworkInterfaces,
          shouldDeleteVolumes:           shouldDeleteVolumes,
          shouldDeleteSnapshots:         shouldDeleteSnapshots
        }
      }
    };
    
    request(deleteOptions, function(err, res, body) {
      spotUtil.validateResponse({
        err:       err,
        res:       res,
        body:      body,
        event:     event,
        context:   context,
        resource:  'elasticgroup',
        action:    'delete',
        successCb: function(spotResponse) {
          try {
            body = JSON.parse(body);
          }
          catch(err) {
          }
          util.done(err, event, context, body);
        },
        failureCb: function(spotResponse) {
          console.log("Can't delete the group, check if the group even exists")
          spotUtil.validateGroup(refId, token, event, context);
        }
      });
    });
    
  });
};

var getDeletePolicyConfig = function(event) {
  var deletePolicy = _.get(event, 'ResourceProperties.deletePolicy') || _.get(event, 'deletePolicy');
  return deletePolicy;
};

/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, destroy]);
};

