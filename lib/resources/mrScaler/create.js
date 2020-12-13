"use strict";

var handler      = require('lambda-formation').resource.create;
var util         = require('lambda-formation').util;
var request      = require('request');
var spotUtil     = require('../../util');
var async        = require('async');
var mrScalerUtil = require('./util');

/**
 * This function create a mrScaler cluster from the user input parameters
 *
 * @function
 * @name create
 *
 * @param {Object} err - Err data from Lambda
 * @param {Object} event - Event data from Lambda
 * @param {Object} context - Context data from Lambda
 */
var create = function(err, event, context) {
  spotUtil.getTokenAndConfig(event, function(err, tc) {
    console.log('Creating Event: ' + JSON.stringify(event, null, 2));

    if(err){
      return util.done(err, event, context);
    }

    mrScalerUtil.castNumericStringToNumber(mrScalerUtil.skeleton, tc.config);

    if(spotUtil.checkAutoTag(event)){
      let autoTags = spotUtil.generateTags(event)

      if(spotUtil.tagsExsist(tc.config)){
        autoTags.forEach((singleTag)=>{
          tc.config.compute.tags.push(singleTag)
        })
      }
      else{
        tc.config.compute.tags = autoTags
      }
    }

    var createOptions = {
      method:  'POST',
      url:     'https://api.spotinst.io/aws/emr/mrScaler',
      qs:      {
        accountId      : spotUtil.getAccountId(event)
      },
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': 'Bearer ' + tc.token,
        'User-Agent'   : spotUtil.getUserAgent()
      },
      json:    {
        mrScaler: tc.config
      }
    };

    console.log('Creating MrScaler: ' + JSON.stringify(tc.config, null, 2));
    let createRequest = (cb, err) =>{
      request(createOptions, function(err, res, body) {
        spotUtil.validateResponse({
          err:       err,
          res:       res,
          body:      body,
          event:     event,
          context:   context,
          resource:  'elasticgroup',
          action:    'create',
          successCb: function(spotResponse) {
            cb(null, spotResponse)
          },
          failureCb: function(spotResponse){
            cb(spotResponse);
          }
        });
      });
    }

    let errorFilter = (spotResponse)=>{
      let errors = spotResponse.body.response.errors
      for(err in errors){
        if(errors[err].code === "RequestLimitExceeded"){
          return true
        }
      }
      return false
    }

    async.retry({times: 5, interval: 1000, errorFilter: errorFilter}, createRequest, (err, res)=>{
      if(err){
        let physicalResourceId = event.PhysicalResourceId || "ResourceFailed";
        let error =  "mrScaler create failed: " + err.errMsg;
        console.log(`${physicalResourceId} failed: ${error}`)

        return util.done(error, event, context, null, physicalResourceId);
      }
      else{
        let options = {
          cfn_responder: {
            returnError: false,
            logLevel:    "debug"
          }
        };
        let physicalResourceId = res.body.response.items[0].id
        console.log(`${physicalResourceId} creation success`)

        return util.done(null, res.event, res.context, null, physicalResourceId, options);
      }
    })
  });
};

/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, create]);
};

