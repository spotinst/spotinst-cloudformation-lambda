var _            = require('lodash');
var handler      = require('lambda-formation').resource.delete;
var util         = require('lambda-formation').util;
var request      = require('request');
var spotUtil     = require('../../util');
var mrScalerUtil = require('./util');

var async    = require('asyncawait/async');
var await    = require('asyncawait/await');
var asyncLib = require('async')

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
let destroy = async(function(err, event, context) {
  if(err) {
    return util.done(err);
  }
  console.log('Delete Event: ' + JSON.stringify(event, null, 2));

  spotUtil.getToken(event, function(err, token) {
    if(err) return util.done(err, event, context);
    
    var refId = event.id || event.PhysicalResourceId;
    
    if(spotUtil.checkAutoTag(event)){
      refId = await((cb, res)=>{
        asyncLib.retry({times: 10, interval: 1000}, mrScalerUtil.getMrScalerFromTags.bind({event:event, token:token}), (err, res)=>{
          if(err){
            console.log(err)
            util.done(err, event, context, {});
          }else{
            console.log(res)
            return cb(null, res)
          }
        })
      })
    }

    // Let CloudFormation rollbacks happen for failed stacks
    if(event.StackId && !_.startsWith(refId, 'simrs')){
      return util.done(null, event, context);
    }
    
    var deleteOptions = {
      method:  'DELETE',
      url:     'https://api.spotinst.io/aws/emr/mrScaler/' + refId,
      qs:      {
        accountId      : spotUtil.getSpotinstAccountId(event)
      },
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': 'Bearer ' + token,
        'User-Agent'   : spotUtil.getUserAgent()
      }
    };
    
    console.log('Delete Event: ' + JSON.stringify(deleteOptions, null, 2));
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
          if(typeof spotResponse.body === "string"){
            spotResponse.body = JSON.parse(spotResponse.body)
          }
          return util.done(err, event, context, spotResponse.body);        
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
    
  });
});


/* Do not change this function */
module.exports.handler = async(function(event, context) {
  handler.apply(this, [event, context, destroy]);
});

