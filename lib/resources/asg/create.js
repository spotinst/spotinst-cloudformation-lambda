var handler  = require('lambda-formation').resource.create;
var util     = require('lambda-formation').util;
var request  = require('request');
var spotUtil = require('../../util');

var import = function(err, event, context) {
  if(err) {
    return util.done(err);
  }

  spotUtil.getTokenAndConfig(event, function(err, tc) {
    if(err) return util.done(err, event, context);

    var importOptions = {
      method:  'POST',
      url:     'https://api.spotinst.io/aws/ec2/group/autoScalingGroup/import?',
      qs:      {
        accountId:            spotUtil.getSpotinstAccountId(event),
        region:               spotUtil.getRegion(event),
        autoScalingGroupName: spotUtil.getASGName(event),
        dryRun:               spotUtil.getDryRun(event)
      },
      headers: {
        'content-type' : 'application/json',
        'Authorization': 'Bearer ' + tc.token,
        'User-Agent'   : spotUtil.getUserAgent()
      },
      body: spotUtil.getBody(event),
      json:    {
        action: tc.config
      }
    };

    console.log('Importing ASG action: ' + JSON.stringify(tc.config, null, 2));
    request(importOptions, function(err, res, body) {
      spotUtil.validateResponse({
        err:       err,
        res:       res,
        body:      body,
        event:     event,
        context:   context,
        resource:  'ASG',
        action:    'import',
        successCb: function(spotResponse) {
          var options = {
            cfn_responder: {
              returnError: false
            }
          };
          util.done(err, event, context, body, body.response.items[0].id, options);
        }
      });
    });

  });

};

/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, create]);
};
