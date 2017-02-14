var handler = require('lambda-formation').resource.update;
var util = require('lambda-formation').util;
var request = require('request');
var spotUtil = require('../../util');

var update = function (err, event, context) {
  if (err) {
    return util.done(err);
  }

  spotUtil.getTokenAndConfig(event, function(err,tc) {
    if (err) return util.done(err,event,context);

    var refId = event.id || event.PhysicalResourceId;

    delete tc.config.resourceId;

    var createOptions = {
      method: 'PUT',
      url: 'https://api.spotinst.io/healthCheck/' + refId,
      headers: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + tc.token
      },
      json: {
        healthCheck: tc.config
      }
    };

    console.log('Updating health check ' + refId + ' ' + JSON.stringify(tc.config, null, 2));
    request(createOptions, function (err, res, body) {
      spotUtil.validateResponse({
        err: err,
        res: res,
        body: body,
        event: event,
        context: context,
        resource: 'healthCheck',
        action: 'update',
        successCb: function(spotResponse) {
          var options = {
            cfn_responder: {
              returnError: false
            }
          };
          util.done(err,event,context,body,refId, options);
        }
      });
    });

  });
};


/* Do not change this function */
module.exports.handler = function (event, context) {
  handler.apply(this, [event, context, update]);
};

