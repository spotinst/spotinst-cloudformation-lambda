var _        = require('lodash');
var handler  = require('lambda-formation').resource.delete;
var util     = require('lambda-formation').util;
var request  = require('request');
var spotUtil = require('../../util');

var destroy = function(err, event, context) {
  if(err) {
    return util.done(err);
  }
  
  spotUtil.getToken(event, function(err, token) {
    if(err) return util.done(err, event, context);
    
    var refId = event.id || event.PhysicalResourceId;
    
    // Let CloudFormation rollbacks happen for failed stacks
    if(event.StackId && !_.startsWith(refId, 'simrs'))
      return util.done(null, event, context);
    
    console.log('Deleting MrScaler: ' + refId);
    var deleteOptions = {
      method:  'DELETE',
      url:     'https://api.spotinst.io/aws/emr/mrScaler/' + refId,
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
        resource:  'mrScaler',
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


/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, destroy]);
};

