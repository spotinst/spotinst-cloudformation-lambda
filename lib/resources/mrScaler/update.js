var handler      = require('lambda-formation').resource.update;
var util         = require('lambda-formation').util;
var request      = require('request');
var _            = require('lodash');
var spotUtil     = require('../../util');
var mrScalerUtil = require('lib/resources/mrScaler/util');

var update = function(err, event, context) {
  if(err) {
    return util.done(err);
  }
  
  spotUtil.getTokenAndConfig(event, function(err, tc) {
    if(err) return util.done(err, event, context);
    
    _.unset(tc.config, 'strategy');
    _.unset(tc.config, 'region');
    _.unset(tc.config, 'compute.tags');
    _.unset(tc.config, 'compute.availabilityZones');
    _.unset(tc.config, 'compute.instanceGroups.masterGroup');
    _.unset(tc.config, 'compute.instanceGroups.coreGroup.instanceTypes');
    _.unset(tc.config, 'compute.instanceGroups.coreGroup.lifeCycle');
    _.unset(tc.config, 'compute.instanceGroups.taskGroup.lifeCycle');
    
    var refId = event.id || event.PhysicalResourceId;
    mrScalerUtil.castNumericStringToNumber(mrScalerUtil.skeleton, tc.config);
    
    var updateOptions = {
      method:  'PUT',
      url:     'https://api.spotinst.io/aws/emr/mrScaler/' + refId,
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + tc.token
      },
      json:    {
        mrScaler: tc.config
      }
    };
    
    console.log('Updating group ' + refId + ':' + JSON.stringify(tc.config, null, 2));
    
    request(updateOptions, function(err, res, body) {
      spotUtil.validateResponse({
        err:       err,
        res:       res,
        body:      body,
        event:     event,
        context:   context,
        resource:  'MrScaler',
        action:    'update',
        successCb: function(spotResponse) {
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
};

/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, update]);
};
