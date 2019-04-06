var handler  = require('lambda-formation').resource.update;
var util     = require('lambda-formation').util;
var request  = require('request');
var _        = require('lodash');
var spotUtil = require('../../util');

/**
 * This function updated an elastigroup 
 *
 * @function
 * @name update
 *
 * @param {Object} err - Err data from Lambda
 * @param {Object} event - Event data from Lambda
 * @param {Object} context - Context data from Lambda
 *
 * @property {String} asg name string 
 */
var update = function(err, event, context) {
  if(err) {
    return util.done(err);
  }
  
  spotUtil.getTokenAndConfig(event, function(err, tc) {
    if(err) {
      return util.done(err, event, context);
    }
    
    let updatePolicy = spotUtil.getUpdatePolicyConfig(event) || {};
    let refId        = event.id || event.PhysicalResourceId;
    var accountId       = spotUtil.getSpotinstAccountId(event);

    let getConfig = {
      url:     'https://api.spotinst.io/aws/ec2/group/'+refId,
      qs:      {
        accountId,
      },
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': 'Bearer ' + tc.token,
        'User-Agent'   : spotUtil.getUserAgent()
      }
    }

    request(getConfig, function(err, res, body) {
      spotUtil.validateResponse({
        err:       err,
        res:       res,
        body:      body,
        event:     event,
        context:   context,
        resource:  'Elastigroup',
        action:    'get',
        successCb: function() {
          var jsonBody            = JSON.parse(body);
          var beanstalkId = _.get(jsonBody, 'response.items[0].thirdPartiesIntegration.elasticBeanstalk.environmentId');

          let groupConfig  = {};
          let srcConfig    = tc.config || {};

          _.set(groupConfig, 'capacity', srcConfig.capacity);
          _.set(groupConfig, 'compute.instanceTypes.spot', srcConfig.spotInstanceTypes);
          _.set(groupConfig, 'thirdPartiesIntegration.elasticBeanstalk.environmentId', beanstalkId)
          setName(groupConfig, tc);
          
          if(srcConfig.hasOwnProperty('healthCheckType')) {
            _.set(groupConfig, 'compute.launchSpecification.healthCheckType', srcConfig.healthCheckType);
          }
          
          if(srcConfig.hasOwnProperty('healthCheckGracePeriod')) {
            _.set(groupConfig, 'compute.launchSpecification.healthCheckGracePeriod', srcConfig.healthCheckGracePeriod);
          }

          if(srcConfig.beanstalk != null && srcConfig.beanstalk.managedActions != null) {
            _.set(groupConfig, 'thirdPartiesIntegration.elasticBeanstalk.managedActions', srcConfig.beanstalk.managedActions)
          }

          if(srcConfig.beanstalk != null && srcConfig.beanstalk.deploymentPreferences != null) {
            _.set(groupConfig, 'thirdPartiesIntegration.elasticBeanstalk.deploymentPreferences', srcConfig.beanstalk.deploymentPreferences)
          }

          var customGroupConfig     = _.get(tc, 'config.groupConfig');

          _.merge(groupConfig, customGroupConfig)

          spotUtil.updateGroup({
            event        : event, 
            context      : context, 
            updatePolicy : updatePolicy, 
            refId        : refId, 
            token        : tc.token, 
            body         : groupConfig
          })



        },
        failureCb: function(){

        }
      })
    })
  
    function setName(groupConfig, tc) {
      let name = _.get(tc, 'config.name')
      if(name != null && _.isEmpty(name) == false)
        _.set(groupConfig, 'name', name);
    }
  });
}

/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, update]);
};



