var handler      = require('lambda-formation').resource.create;
var util         = require('lambda-formation').util;
var request      = require('request');
var spotUtil     = require('../../util');
var mrScalerUtil = require('lib/resources/mrScaler/util');

var create = function(err, event, context) {
  if(err) {
    return util.done(err);
  }
  
  spotUtil.getTokenAndConfig(event, function(err, tc) {
    if(err) return util.done(err, event, context);
    
    mrScalerUtil.castNumericStringToNumber(mrScalerUtil.skeleton, tc.config);
    var createOptions = {
      method:  'POST',
      url:     'https://api.spotinst.io/aws/emr/mrScaler',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + tc.token
      },
      json:    {
        mrScaler: tc.config
      }
    };
    
    console.log('Creating MrScaler: ' + JSON.stringify(tc.config, null, 2));
    request(createOptions, function(err, res, body) {
      spotUtil.validateResponse({
        err:       err,
        res:       res,
        body:      body,
        event:     event,
        context:   context,
        resource:  'mrScaler',
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

