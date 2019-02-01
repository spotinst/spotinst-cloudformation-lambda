var spotUtil = require('../../util');
var request  = require('request');
var _        = require('lodash');
var util     = require('lambda-formation').util;
var async = require('async')

/**
 * This function gets all the mrScalers in the user account and checks that the group tags match the 
 * auto generated tags and returns the group id for the match
 *
 * @function
 * @name getElastigroupFromTags
 *
 * @param {Object} cb - Callback function
 */
module.exports.getMrScalerFromTags = function(event, context, token){
  return new Promise((resolve, reject)=>{
    let autoTags = spotUtil.generateTags(event)
    console.log('AutoTags: ' + JSON.stringify(autoTags, null, 2))

    var getAllMrScalerOptions = {
      url:"https://api.spotinst.io/aws/emr/mrScaler",
      method:"GET",
      qs:{
        accountId: spotUtil.getSpotinstAccountId(event)
      },
      headers:{
          'Content-Type' : 'application/json',
          'Authorization': 'Bearer ' + token,
          'User-Agent'   : spotUtil.getUserAgent()
      }
    }

    console.log('Getting All MrScaler: ' + JSON.stringify(getAllMrScalerOptions, null, 2));

    let getAllMrScaler = (cb, err) =>{
      request(getAllMrScalerOptions, function(err, res, body) {
        spotUtil.validateResponse({
          err:       err,
          res:       res,
          body:      body,
          event:     event,
          context:   context,
          resource:  'mrScaler',
          action:    'get-all',
          successCb: function(spotResponse) {
            body = JSON.parse(spotResponse.body);
            let mrScalers = body.response.items

            mrScalers.forEach((singleScaler)=>{
              console.log('singleScaler: ' + JSON.stringify(singleScaler, null, 2));

              let tags = singleScaler.compute.tags
              if(_.find(tags, autoTags[0]) && _.find(tags, autoTags[1]) && _.find(tags, autoTags[2])){
                console.log(`${singleScaler.id} group found by tags`)
                cb(null, singleScaler.id)
              }
            })

            cb("mrScaler not found from tags")
          },
          failureCb: function(spotResponse){
            cb(spotResponse.errMsg);
          }
        });
      });
    } 

    async.retry({times: 5, interval: 1000}, getAllMrScaler, (err, res)=>{
      if(err){
        return reject(err)
      }else{
        return resolve(res)
      }
    })
  })
}

module.exports.validateCluster = function(clusterId, token, event, context) {
  var getOptions = {
    method:  'GET',
    url:     'https://api.spotinst.io/aws/emr/mrScaler/' + clusterId,
    qs:      {
      accountId: spotUtil.getSpotinstAccountId(event)
    },
    headers: {
      'content-type' : 'application/json',
      'Authorization': 'Bearer ' + token,
      'User-Agent'   : spotUtil.getUserAgent()
    }
  };
  
  request(getOptions, function(err, res, body) {
    spotUtil.validateResponse({
      err:       err,
      res:       res,
      body:      body,
      event:     event,
      context:   context,
      successCb: function(spotResponse) {
        console.log("The cluster does exist, fail the delete.");
        // Return failed to delete (cause the group does exist)
        util.done("Validate Failed", event, context);
      },
      failureCb: function(spotResponse) {
        // if the cluster doesn't exists, we can count the delete as success
        console.log("spotResponse.res.statusCode",spotResponse.res.statusCode)
        if(spotResponse.res.statusCode === 404 || spotResponse.res.statusCode === 400) {
          console.log("The cluster doesn't exist, set the delete as success.")
          if(typeof body === "string"){
            body = JSON.parse(body)
          }
          util.done(null, event, context, body);  
        }
        else {
          util.done("can't get cluster", event, context);
        }
      }
    });
  });
}

module.exports.skeleton = {
  compute:     {
    instanceGroups: {
      coreGroup:   {
        target:   null,
        capacity: {
          maximum: null,
          minimum: null,
          target:  null
        }
      },
      masterGroup: {
        target: null
      },
      taskGroup:   {
        capacity: {
          maximum: null,
          minimum: null,
          target:  null
        }
      }
    }
  },
  scaling:     {
    up:   [
      {
        threshold:         null,
        minTargetCapacity: null,
        evaluationPeriods: null,
        cooldown:          null,
        action:            {
          adjustment: null,
          maximum:    null,
          minimum:    null,
          target:     null
        }
      }
    ],
    down: [
      {
        threshold:         null,
        maxTargetCapacity: null,
        evaluationPeriods: null,
        cooldown:          null,
        action:            {
          adjustment: null,
          maximum:    null,
          minimum:    null,
          target:     null
        }
      }
    ]
  },
  coreScaling: {
    up:   [
      {
        threshold:         null,
        minTargetCapacity: null,
        evaluationPeriods: null,
        cooldown:          null,
        action:            {
          adjustment: null,
          maximum:    null,
          minimum:    null,
          target:     null
        }
      }
    ],
    down: [
      {
        threshold:         null,
        maxTargetCapacity: null,
        evaluationPeriods: null,
        cooldown:          null,
        action:            {
          adjustment: null,
          maximum:    null,
          minimum:    null,
          target:     null
        }
      }
    ]
  },
  strategy:    {
    cloning: {
      numberOfRetries: null
    }
  }
};

var _validate = module.exports.castNumericStringToNumber = function(skeleton, config) {
  for(var key in skeleton) {
    var configHasProperty = config.hasOwnProperty(key);
    if(configHasProperty === false) {
      continue; //no need to dig deeper
    }
    if(skeleton[key] === null) {
      config[key] = Number(config[key])
    } else {
      _validate(skeleton[key], config[key]);
    }
  }
};