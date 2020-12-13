var handler      = require('lambda-formation').resource.update;
var util         = require('lambda-formation').util;
var request      = require('request');
var _            = require('lodash');
var spotUtil     = require('../../util');
var mrScalerUtil = require('./util');

/**
 * This function updates a mrScaler cluster. It only selects the editable fields from the
 * template and parses the integer values from strings if they have converted.
 * NOTE visible to all users is not supported at the moment
 *
 * @function
 * @name update
 *
 * @param {Object} err - Err data from Lambda
 * @param {Object} event - Event data from Lambda
 * @param {Object} context - Context data from Lambda
 */
var update = function(err, event, context) {
  spotUtil.getTokenAndConfig(event, function(err, tc) {
    console.log('Update Event: ' + JSON.stringify(event, null, 2));

    if(err) {
      return util.done(err, event, context);
    }

    mrScalerUtil.castNumericStringToNumber(mrScalerUtil.skeleton, tc.config);

    let instanceGroups       = _.get(tc.config, 'compute.instanceGroups')
    let terminationProtected = _.get(tc.config, 'cluster.terminationProtected')
    // let visibleToAllUsers    = _.get(tc.config, 'cluster.visibleToAllUsers')

    _.unset(instanceGroups, 'masterGroup');
    _.unset(instanceGroups, 'coreGroup.instanceTypes');
    _.unset(instanceGroups, 'coreGroup.lifeCycle');
    _.unset(instanceGroups, 'taskGroup.lifeCycle');

    let mrScaler = {
      compute:{
        instanceGroups: instanceGroups
      },
      cluster:{
        terminationProtected: terminationProtected,
        // visibleToAllUsers: visibleToAllUsers
      }
    }

    var refId = event.id || event.PhysicalResourceId;

    var updateOptions = {
      method:  'PUT',
      url:     'https://api.spotinst.io/aws/emr/mrScaler/' + refId,
      qs:      {
        accountId      : spotUtil.getAccountId(event)
      },
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': 'Bearer ' + tc.token,
        'User-Agent'   : spotUtil.getUserAgent()
      },
      json:    {
        mrScaler: mrScaler
      }
    };

    console.log('Updating group ' + refId + ':' + JSON.stringify(updateOptions, null, 2));

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
          util.done(null, event, context, {}, refId, options);
        }
      });
    });
  });
};

/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, update]);
};
