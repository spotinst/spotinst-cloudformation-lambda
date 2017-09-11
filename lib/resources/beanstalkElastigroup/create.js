var handler  = require('lambda-formation').resource.create;
var util     = require('lambda-formation').util;
var request  = require('request');
var spotUtil = require('../../util');
var _        = require('lodash');

function createGroup(importedConfig, beanstalkGroupConfig, event, context, token, accountId) {
  _.set(importedConfig, 'capacity', beanstalkGroupConfig.capacity);
  _.set(importedConfig, 'compute.instanceTypes.spot', beanstalkGroupConfig.spotInstanceTypes);
  _.set(importedConfig, 'compute.product', beanstalkGroupConfig.product);
  
  var createOptions = {
    method:  'POST',
    url:     'https://api.spotinst.io/aws/ec2/group',
    qs:      {
      accountId
    },
    headers: {
      'Content-Type':  'application/json',
      'Authorization': 'Bearer ' + token
    },
    json:    {
      group: importedConfig
    }
  };
  
  console.log('Creating group from beanstalk config: ' + JSON.stringify(importedConfig, null, 2));
  request(createOptions, function(err, res, body) {
    spotUtil.validateResponse({
      err:       err,
      res:       res,
      body:      body,
      event:     event,
      context:   context,
      resource:  'beanstalkElastigroup',
      action:    'create',
      successCb: function(spotResponse) {
        var options = {
          cfn_responder: {
            returnError: false,
            logLevel:    "debug"
          }
        };
        var groupId = _.get(body, 'response.items[0].id');
        util.done(err, event, context, {}, groupId, options);
      }
    });
  });
}

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
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + tc.token
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
          var placements          = _.get(importedGroupConfig, 'compute.availabilityZones');
          _.forEach(placements, placement => placement.subnetId = undefined);
          createGroup(importedGroupConfig, tc.config, event, context, tc.token, accountId);
        }
      });
    });
  });
};

/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, create]);
};

