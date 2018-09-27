var _        = require('lodash');
var handler  = require('lambda-formation').resource.delete;
var util     = require('lambda-formation').util;
var request  = require('request');
var spotUtil = require('../../util');


/**
 * This function deletes an elastigroup that was created from an exsisting beansta;l using the delete elastigroup API call
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
var destroy = function(err, event, context) {
  if(err) {
    return util.done(err);
  }
  
  spotUtil.getToken(event, function(err, token) {
    if(err) return util.done(err, event, context);
    
    var refId = event.id || event.PhysicalResourceId;
    
    // Let CloudFormation rollbacks happen for failed stacks
    if(event.StackId && !_.startsWith(refId, 'sig'))
      return util.done(null, event, context);
    
    let deletePolicy = getDeletePolicyConfig(event) || {}

    let rollbackToAsg     = spotUtil.parseBoolean(deletePolicy.rollbackToAsg)
    let shouldForceDelete = spotUtil.parseBoolean(deletePolicy.shouldForceDelete)

    console.log('Deleting beanstalk group: ' + refId);
    var deleteOptions = {
      method:  'DELETE',
      url:     'https://api.spotinst.io/aws/ec2/group/' + refId,
      qs:      {
        accountId: spotUtil.getSpotinstAccountId(event)
      },
      json: {
        beanstalk:{
          rollbackToAsg: rollbackToAsg,
          shouldForceDelete: shouldForceDelete
        }
      },
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': 'Bearer ' + token,
        'User-Agent'   : spotUtil.getUserAgent()
      }
    };
    
    console.log(deleteOptions)

    request(deleteOptions, function(err, res, body) {
      spotUtil.validateResponse({
        err:       err,
        res:       res,
        body:      body,
        event:     event,
        context:   context,
        resource:  'beanstalkElastigroup',
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
          console.log("Can't delete beanstalk group, check if the group even exists");
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

