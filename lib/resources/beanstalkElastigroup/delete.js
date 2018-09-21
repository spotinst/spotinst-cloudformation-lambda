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
    
    console.log('Deleting beanstalk group: ' + refId);
    var deleteOptions = {
      method:  'DELETE',
      url:     'https://api.spotinst.io/aws/ec2/group/' + refId,
      qs:      {
        accountId: spotUtil.getSpotinstAccountId(event)
      },
      json:    {
        beanstalk: {
          rollbackToAsg: false
        }
      },
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': 'Bearer ' + token,
        'User-Agent'   : spotUtil.getUserAgent()
      }
    };
    
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
          validateGroup(refId, token, event, context);
        }
      });
    });
    
  });
};

/**
 * This function is called when the destroy function fails. it checks if the group exisists 
 *
 * @function
 * @name validateGroup
 *
 * @param {String} groupId - Elastigroup ID
 * @param {Sgtring} token - Spotinst API Token
 * @param {Object} event - Event data from Lambda
 * @param {Object} context - Context data from Lambda
 *
 * @property {String} asg name string 
 */
function validateGroup(groupId, token, event, context) {
  var getGroupOptions = {
    method:  'GET',
    url:     'https://api.spotinst.io/aws/ec2/group/' + groupId,
    qs:      {
      accountId: spotUtil.getSpotinstAccountId(event)
    },
    headers: {
      'content-type' : 'application/json',
      'Authorization': 'Bearer ' + token,
      'User-Agent'   : spotUtil.getUserAgent()
    }
  };
  
  request(getGroupOptions, function(err, res, body) {
    spotUtil.validateResponse({
      err:       err,
      res:       res,
      body:      body,
      event:     event,
      context:   context,
      resource:  'beanstalkElastigroup',
      action:    'get',
      successCb: function(spotResponse) {
        console.log("The group does exist, fail the delete.");
        // Return failed to delete (cause the group does exist)
        util.done(spotResponse.resource + " " + spotResponse.action + " failed", event, context);
      },
      failureCb: function(spotResponse) {
        // if the group doesn't exists, we can count the delete as success
        if(spotResponse.res.statusCode === 404 || spotResponse.res.statusCode === 400) {
          
          console.log("The group doesn't exist, set the delete as success.")
          try {
            body = JSON.parse(body);
          }
          catch(err) {
          }
          util.done(null, event, context, body);
        }
        else {
          util.done("beanstalk group delete failed. can't get group", event, context);
        }
      }
    });
  });
}

/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, destroy]);
};

