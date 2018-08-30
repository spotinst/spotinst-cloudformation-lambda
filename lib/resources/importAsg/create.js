var handler  = require('lambda-formation').resource.create;
var util     = require('lambda-formation').util;
var request  = require('request');
var spotUtil = require('../../util');
var asgLib   = require('./lib/core')


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
var create = function(err, event, context) {
  if(err) {
    return util.done(err);
  }

  spotUtil.getTokenAndConfig(event, function(err, tc) {
    if(err) return util.done(err, event, context);

    if(asgLib.getDryRun(event)){
      return util.done("Cannot set Dry Run to True", event)
    }

    // take out region asgname, dryrun
    var importOptions = {
      method:  'POST',
      url:     'https://api.spotinst.io/aws/ec2/group/autoScalingGroup/import',
      qs:      {
        accountId:            spotUtil.getSpotinstAccountId(event),
        region:               asgLib.getRegion(event),
        autoScalingGroupName: asgLib.getASGName(event)        
      },
      headers: {
        'content-type' : 'application/json',
        'Authorization': 'Bearer ' + tc.token,
        'User-Agent'   : spotUtil.getUserAgent()
      },
      json:    {
        group: tc.config
      }
    };

    request(importOptions, function(err, res, body) {
      console.log(err)
      console.log(res)
      console.log(body)
      spotUtil.validateResponse({
        err:       err,
        res:       res,
        body:      body,
        event:     event,
        context:   context,
        resource:  'ASG',
        action:    'Import',
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
