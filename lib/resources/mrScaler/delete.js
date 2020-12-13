var _            = require('lodash');
var handler      = require('lambda-formation').resource.delete;
var util         = require('lambda-formation').util;
var request      = require('request');
var spotUtil     = require('../../util');
var mrScalerUtil = require('./util');

var async = require('async')

/**
 * This function deletes a mrScaler cluster that was created the delete mrScaler API call
 *
 * @function
 * @name destroy
 *
 * @param {Object} err - Err data from Lambda
 * @param {Object} event - Event data from Lambda
 * @param {Object} context - Context data from Lambda
 */
let destroy = async function(err, event, context) {
  console.log('Delete Event: ' + JSON.stringify(event, null, 2));
  let token, refId

  token = await spotUtil.getTokenAsync({event:event,context:context})
    .catch((err)=>{
      return util.done(err, event, context, {});
    })

  refId = event.id || event.PhysicalResourceId;

  // Let CloudFormation rollbacks happen for failed stacks
  if(refId == "ResourceFailed"){
    console.log("ResourceFailed")
    return util.done(null, event, context, "ResourceFailed");
  }

  // getting mrScaler from autoTags
  if(spotUtil.checkAutoTag(event)){
    refId = await mrScalerUtil.getMrScalerFromTags(event, context, token)
      .catch((err)=>{
        return util.done(err, event, context, {});
      })
  }

  var deleteOptions = {
    method:  'DELETE',
    url:     'https://api.spotinst.io/aws/emr/mrScaler/' + refId,
    qs:      {
      accountId      : spotUtil.getAccountId(event)
    },
    headers: {
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + token,
      'User-Agent'   : spotUtil.getUserAgent()
    }
  };

  console.log('MrScaler Delete Event: ' + JSON.stringify(deleteOptions, null, 2));
  request(deleteOptions, function(err, res, body) {
    spotUtil.validateResponse({
      err:       err,
      res:       res,
      body:      body,
      event:     event,
      context:   context,
      resource:  'mrScaler',
      action:    'delete',
      successCb: function(spotResponse) {
        if(typeof body === "string"){
          body = JSON.parse(body)
        }

        console.log("success delete mrScaler")
        util.done(null, event, context, body);
      },
      failureCb: function(spotResponse) {
        body = JSON.parse(body);
        let errors = body.response.errors

        for (inc in errors){
          let errMessage = errors[inc].message
          if(errMessage.split(".")[1] == " Please disable termination protection and try again"){
            util.done(errMessage, event, context, body)
          }
        }

        console.log("Can't delete the cluster, check if the cluster even exists")
        mrScalerUtil.validateCluster(refId, token, event, context);
      }
    });
  });
};

/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, destroy]);
};

