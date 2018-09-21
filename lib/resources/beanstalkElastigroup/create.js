var handler  = require('lambda-formation').resource.create;
var util     = require('lambda-formation').util;
var request  = require('request');
var spotUtil = require('../../util');
var _        = require('lodash');

/**
 * This function creates an elastigroup from an beanstalk formation using the import beanstalk API call
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
    if(err) {
      return util.done(err, event, context);
    }
    
    var environmentId   = _.get(tc, 'config.beanstalk.environmentId');
    var environmentName = _.get(tc, 'config.beanstalk.environmentName');
    var region          = _.get(tc, 'config.region');

    var groupConfig     = _.get(tc, 'config.groupConfig');
    
    var accountId       = spotUtil.getSpotinstAccountId(event);
    
    console.log('Importing beanstalk configurations for: ' + JSON.stringify(tc.config, null, 2));
    
    var importOptions = {
      method:  'GET',
      url:     'https://api.spotinst.io/aws/ec2/group/beanstalk/import',
      qs:      {
        accountId,
        region,
        environmentName,
        environmentId
      },
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': 'Bearer ' + tc.token,
        'User-Agent'   : spotUtil.getUserAgent()
      }
    };
    
    console.log('Creating beanstalk group: ' + JSON.stringify(tc.config, null, 2));

    request(importOptions, function(err, res, body) {
      spotUtil.validateResponse({
        err:       err,
        res:       res,
        body:      body,
        event:     event,
        context:   context,
        resource:  'beanstalkElastigroup',
        action:    'import',
        successCb: function() {
          var jsonBody            = JSON.parse(body);
          var importedGroupConfig = _.get(jsonBody, 'response.items[0]');
          _.merge(importedGroupConfig, groupConfig)          
          var placements          = _.get(importedGroupConfig, 'compute.availabilityZones');
          _.forEach(placements, placement => placement.subnetId = undefined);
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

