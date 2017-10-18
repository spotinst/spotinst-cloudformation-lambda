var handler  = require('lambda-formation').resource.update;
var util     = require('lambda-formation').util;
var request  = require('request');
var _        = require('lodash');
var spotUtil = require('../../util');

var update = function(err, event, context) {
  if(err) {
    return util.done(err);
  }
  
  spotUtil.getTokenAndConfig(event, function(err, tc) {
    if(err) {
      return util.done(err, event, context);
    }
    
    var refId       = event.id || event.PhysicalResourceId;
    let groupConfig = {};
    _.set(groupConfig, 'capacity', _.get(tc, 'config.capacity'));
    _.set(groupConfig, 'compute.instanceTypes.spot', _.get(tc, 'config.spotInstanceTypes'));
    setName(groupConfig,tc);

    _.pick(tc.config, ['spotInstanceTypes', 'capacity']);
    
    var updateOptions = {
      method:  'PUT',
      url:     'https://api.spotinst.io/aws/ec2/group/' + refId,
      qs:      {
        accountId: spotUtil.getSpotinstAccountId(event)
      },
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + tc.token
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

    function setName(groupConfig,tc) {
        let name = _.get(tc, 'config.name')
        if (name != null && _.isEmpty(name) == false)
            _.set(groupConfig, 'name', name);
    }
};

/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, update]);
};















