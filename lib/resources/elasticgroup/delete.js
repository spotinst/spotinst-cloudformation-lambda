var handler     = require('lambda-formation').resource.delete;
var _           = require('lodash');
var util        = require('lambda-formation').util;
var request     = require('request');
var spotUtil    = require('../../util');

var async = require('asyncawait/async');
var await = require('asyncawait/await');


/**
 * This function deletes an elastigroup that was created from an exsisting beansta;l using the delete elastigroup API call
 *
 * @function
 * @name destroy
 *
 * @param {Object} err - Err data from Lambda
 * @param {Object} event - Event data from Lambda
 * @param {Object} context - Context data from Lambda
 *
 * @property {String} asg name string 
 */
let destroy = async(function(err, event, context) {
  spotUtil.getToken(event, function(err, token) {
    if(err) return util.done(err, event, context);
    
    console.log("Delete Event: " + JSON.stringify(event, null, 2))

    var refId = event.id || event.PhysicalResourceId;
    
    // Let CloudFormation rollbacks happen for failed stacks
    if(refId == "Resource Failed"){
      console.log("rolling back")
      util.done(null, event, context);
    }

    if(spotUtil.checkAutoTag(event)){
      refId = await(getElastigroupFromTags(event, token))
    }

    let deletePolicy = getDeletePolicyConfig(event) || {}

    let rollbackToAsg     = spotUtil.parseBoolean(deletePolicy.rollbackToAsg)
    let shouldForceDelete = spotUtil.parseBoolean(deletePolicy.shouldForceDelete)

    let shouldDeleteImages            = spotUtil.parseBoolean(deletePolicy.shouldDeleteImages);
    let shouldDeleteNetworkInterfaces = spotUtil.parseBoolean(deletePolicy.shouldDeleteNetworkInterfaces);
    let shouldDeleteVolumes           = spotUtil.parseBoolean(deletePolicy.shouldDeleteVolumes);
    let shouldDeleteSnapshots         = spotUtil.parseBoolean(deletePolicy.shouldDeleteSnapshots);    

    console.log('Deleting group: ' + refId);
    var deleteOptions = {
      method:  'DELETE',
      url:     'https://api.spotinst.io/aws/ec2/group/' + refId,
      qs:      {
        accountId: spotUtil.getSpotinstAccountId(event)
      },
      json: {
        beanstalk:{
          rollbackToAsg:     rollbackToAsg,
          shouldForceDelete: shouldForceDelete
        },
        statefulDeallocation: {
          shouldDeleteImages:            shouldDeleteImages,
          shouldDeleteNetworkInterfaces: shouldDeleteNetworkInterfaces,
          shouldDeleteVolumes:           shouldDeleteVolumes,
          shouldDeleteSnapshots:         shouldDeleteSnapshots
        }
      },
      headers: {
        'Content-Type' : 'application/json',
        'Authorization': 'Bearer ' + token,
        'User-Agent'   : spotUtil.getUserAgent()
      }
    };
    
    console.log(deleteOptions)

    request(deleteOptions, function(err, res, body) {
      spotUtil.validateResponse({
        err:       err,
        res:       res,
        body:      body,
        event:     event,
        context:   context,
        resource:  'elastigroup',
        action:    'delete',
        successCb: function(spotResponse) {
          try {
            body = JSON.parse(body);
          }
          catch(err) {
          }
          util.done(err, event, context, body);
        },
        failureCb: function(spotResponse) {
          console.log("Can't delete group, check if the group even exists");
          spotUtil.validateGroup(refId, token, event, context);
        }
      });
    });
    
  });
});

function getDeletePolicyConfig(event) {
  var deletePolicy = _.get(event, 'ResourceProperties.deletePolicy') || _.get(event, 'deletePolicy');
  return deletePolicy;
};


/**
 * This function gets all the elastigroups in the user account and checks that the group tags match the 
 * auto generated tags and returns the group id for the match
 *
 * @function
 * @name getElastigroupFromTags
 *
 * @param {Object} event - Event data from Lambda
 * @param {Object} token - token for spotinst api
 */
function getElastigroupFromTags(event, token){
  return new Promise((resolve, reject)=>{
    let autoTags = spotUtil.generateTags(event)

    var getAllGroupsOptions = {
      url:"https://api.spotinst.io/aws/ec2/group",
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

    request(getAllGroupsOptions, function(err, res, body){
      if(err){
        return reject(err)
      }

      try{
        body = JSON.parse(body);
      }catch(err) {
        return reject(err)
      }

      let groups = body.response.items

      groups.forEach((singleGroup)=>{
        let tags = singleGroup.compute.launchSpecification.tags

        if(_.find(tags, autoTags[0]) && _.find(tags, autoTags[1]) && _.find(tags, autoTags[2])){
          return resolve(singleGroup.id)
        }
      })
      
      return reject("not found")
    })
  })
}

/* Do not change this function */
module.exports.handler = async(function(event, context) {
  handler.apply(this, [event, context, destroy]);
});

