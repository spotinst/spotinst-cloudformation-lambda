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
    
    let refId = event.id || event.PhysicalResourceId;
    let groupConfig = {};
    let srcConfig   = tc.config || {};
    
    _.set(groupConfig, 'capacity', srcConfig.capacity);
    _.set(groupConfig, 'compute.instanceTypes.spot', srcConfig.spotInstanceTypes);
    setName(groupConfig, tc);
    
    if(srcConfig.hasOwnProperty('healthCheckType')) {
      _.set(groupConfig, 'compute.launchSpecification.healthCheckType', srcConfig.healthCheckType);
    }
    
    if(srcConfig.hasOwnProperty('healthCheckGracePeriod')) {
      _.set(groupConfig, 'compute.launchSpecification.healthCheckGracePeriod', srcConfig.healthCheckGracePeriod);
    }

    var customGroupConfig     = _.get(tc, 'config.groupConfig');

    _.merge(groupConfig, customGroupConfig)
    
    let updateOptions = {
      method:  'PUT',
      url:     'https://api.spotinst.io/aws/ec2/group/' + refId,
      qs:      {
        accountId: spotUtil.getSpotinstAccountId(event)
      },
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': 'Bearer ' + tc.token,
        'User-Agent'   : spotUtil.getUserAgent()
      },
      json:    {
        group: groupConfig
      }
    };
    
    console.log('Updating group ' + refId + ':' + JSON.stringify(groupConfig, null, 2));

    request(updateOptions, function(err, res, body) {
      spotUtil.validateResponse({
        err:       err,
        res:       res,
        body:      body,
        event:     event,
        context:   context,
        resource:  'beanstalkElastigroup',
        action:    'update',
        successCb: function() {
          var options = {
            cfn_responder: {
              returnError: false,
              logLevel:    "debug"
            }
          };
          util.done(err, event, context, {}, refId, options);
        }
      });
    });
  });
  
  function setName(groupConfig, tc) {
    let name = _.get(tc, 'config.name')
    if(name != null && _.isEmpty(name) == false)
      _.set(groupConfig, 'name', name);
  }
};

/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, update]);
};















