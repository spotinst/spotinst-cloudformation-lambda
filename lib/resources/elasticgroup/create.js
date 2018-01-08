var handler  = require('lambda-formation').resource.create;
var util     = require('lambda-formation').util;
var request  = require('request');
var spotUtil = require('../../util');

var create = function(err, event, context) {
  if(err) {
    return util.done(err);
  }
  
  spotUtil.getTokenAndConfig(event, function(err, tc) {
    if(err) return util.done(err, event, context);
    
    var createOptions = {
      method:  'POST',
      url:     'https://api.spotinst.io/aws/ec2/group',
      qs:      {
        accountId: spotUtil.getSpotinstAccountId(event),
        ignoreInitHealthChecks: createPolicy.ignoreInitHealthChecks
      },
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + tc.token
      },
      json:    {
        group: tc.config
      }
    };
    
    console.log('Creating group: ' + JSON.stringify(tc.config, null, 2));
    request(createOptions, function(err, res, body) {
      spotUtil.validateResponse({
        err:       err,
        res:       res,
        body:      body,
        event:     event,
        context:   context,
        resource:  'elasticgroup',
        action:    'create',
        successCb: function(spotResponse) {
          var options = {
            cfn_responder: {
              returnError: false,
              logLevel:    "debug"
            }
          };
          util.done(err, event, context, {}, body.response.items[0].id, options);
        }
      });
    });
  });
};

/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, create]);
};

