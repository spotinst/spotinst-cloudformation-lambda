var handler  = require('lambda-formation').resource.create;
var util     = require('lambda-formation').util;
var request  = require('request');
var spotUtil = require('../../util');
var asgLib   = require('./lib/core')
var _        = require('lodash');

/**
 * This function creates an elastigroup from an exsisting ASG using the import ASG API call
 *
 * @function
 * @name create
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

    // take out region asgname, dryrun
    var accountId = spotUtil.getSpotinstAccountId(event)

    var importOptions = {
      method:  'POST',
      url:     'https://api.spotinst.io/aws/ec2/group/autoScalingGroup/import',
      qs:      {
        accountId            : accountId,
        region               : asgLib.getRegion(event),
        autoScalingGroupName : asgLib.getASGName(event),
        dryRun               : true
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

    var groupConfig     = asgLib.getGroupConfig(event)

    request(importOptions, function(err, res, body) {


      spotUtil.validateResponse({
        err:       err,
        res:       res,
        body:      body,
        event:     event,
        context:   context,
        resource:  'ASG',
        action:    'Import',
        successCb: function(spotResponse) {
          var importedGroupConfig = _.get(body, 'response.items[0]');
          var placements          = _.get(importedGroupConfig, 'compute.availabilityZones');
          
          _.forEach(placements, placement => placement.subnetId = undefined);
          _.merge(importedGroupConfig, groupConfig)          

          spotUtil.createGroup(importedGroupConfig, tc.config, event, context, tc.token, accountId);
        }
      });
    });

  });

};

/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, create]);
};
