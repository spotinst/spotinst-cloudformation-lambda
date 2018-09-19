var handler  = require('lambda-formation').resource.create;
var util     = require('lambda-formation').util;
var request  = require('request');
var spotUtil = require('../../util');
var asgLib   = require('./lib/core')
var _        = require('lodash');


function createGroup(importedConfig, asgGroupConfig, event, context, token, accountId) {
  setName();
  
  var createPolicy = getCreatePolicyConfig(event) || {};
  
  var createOptions = {
    method:  'POST',
    url:     'https://api.spotinst.io/aws/ec2/group',
    qs:      {
      accountId,
      ignoreInitHealthChecks: createPolicy.ignoreInitHealthChecks
    },
    headers: {
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + token,
      'User-Agent'   : spotUtil.getUserAgent()
    },
    json:    {
      group: importedConfig
    }
  };


  console.log('Creating group from asg config: ' + JSON.stringify(importedConfig, null, 2));
  
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
  
  function setName() {
    let name = _.get(asgGroupConfig, 'name');
    if(name != null && _.isEmpty(name) == false)
      _.set(importedConfig, 'name', name);
  }
}

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
    console.log("here")
    console.log(event)

    var groupConfig     = asgLib.getGroupConfig(event)

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
          // var options = {
          //   cfn_responder: {
          //     returnError: false
          //   }
          // };

          var importedGroupConfig = _.get(body, 'response.items[0]');
          var placements          = _.get(importedGroupConfig, 'compute.availabilityZones');
          
          _.forEach(placements, placement => placement.subnetId = undefined);
          _.merge(importedGroupConfig, groupConfig)          
          
          console.log(groupConfig)
          console.log(importedGroupConfig)

          createGroup(importedGroupConfig, tc.config, event, context, tc.token, accountId);


          // util.done(err, event, context, body, body.response.items[0].id, options);
        }
      });
    });

  });

};

var getCreatePolicyConfig = function(event) {
  let createPolicy = _.get(event, 'ResourceProperties.createPolicy') || _.get(event, 'createPolicy');
  return createPolicy;
};

/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, create]);
};
