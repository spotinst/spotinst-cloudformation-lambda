var handler  = require('lambda-formation').resource.delete;
var _        = require('lodash');
var util     = require('lambda-formation').util;
var request  = require('request');
var spotUtil = require('../../util');

var async = require('async')

/**
 * This function deletes an elastigroup that was created from an existing
 * beanstalk using the delete elastigroup API call
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
let destroy = async function(err, event, context) {
  console.log('Delete Event: ' + JSON.stringify(event, null, 2));
  
  let token = await spotUtil.getTokenAsync({
    event:   event,
    context: context
  })
    .catch((err) => {
      return util.done(err, event, context, {});
    })
  
  let refId = event.id || event.PhysicalResourceId;
  
  // Let CloudFormation rollbacks happen for failed stacks
  if(refId == "ResourceFailed") {
    console.log("rolling back")
    return util.done(null, event, context);
  }
  
  if(spotUtil.checkAutoTag(event)) {
    refId = await getElastigroupFromTags(event, token)
      .catch((err) => {
        console.log(err)
        return util.done(err, event, context, {});
      })
  }
  let deletePolicy = getDeletePolicyConfig(event) || {}
  
  if(deletePolicy.asgScaleTarget != undefined) {
    
    event.ResourceProperties.asgOperation = {
      elastigroupThreshold: 0,
      asgTarget:            deletePolicy.asgScaleTarget
    }
    
    await spotUtil.asgOperation({
      event:        event,
      context:      context,
      updatePolicy: spotUtil.getUpdatePolicyConfig(event),
      refId:        refId,
      token:        token
    })
    
    console.log("waiting")
    
    await sleep(120000);
  }
  
  let rollbackToAsg     = _.get(deletePolicy, 'beanstalk.rollbackToAsg') || _.get(deletePolicy, 'rollbackToAsg');
  let shouldForceDelete = _.get(deletePolicy, 'beanstalk.shouldForceDelete') || _.get(deletePolicy, 'shouldForceDelete');
  
  let shouldDeleteImages            = _.get(deletePolicy, 'statefulDeallocation.shouldDeleteImages') || _.get(deletePolicy, 'shouldDeleteImages');
  let shouldDeleteNetworkInterfaces = _.get(deletePolicy, 'statefulDeallocation.shouldDeleteNetworkInterfaces') || _.get(deletePolicy, 'shouldDeleteNetworkInterfaces');
  let shouldDeleteVolumes           = _.get(deletePolicy, 'statefulDeallocation.shouldDeleteVolumes') || _.get(deletePolicy, 'shouldDeleteVolumes');
  let shouldDeleteSnapshots         = _.get(deletePolicy, 'statefulDeallocation.shouldDeleteSnapshots') || _.get(deletePolicy, 'shouldDeleteSnapshots');
  
  let shouldDeleteAmiBackupImages = _.get(deletePolicy, 'amiBackup.shouldDeleteImages');
  
  var deleteOptions = {
    method:  'DELETE',
    url:     'https://api.spotinst.io/aws/ec2/group/' + refId,
    qs:      {
      accountId: spotUtil.getSpotinstAccountId(event)
    },
    json:    {
      beanstalk:            {
        rollbackToAsg:     rollbackToAsg,
        shouldForceDelete: shouldForceDelete
      },
      statefulDeallocation: {
        shouldDeleteImages:            shouldDeleteImages,
        shouldDeleteNetworkInterfaces: shouldDeleteNetworkInterfaces,
        shouldDeleteVolumes:           shouldDeleteVolumes,
        shouldDeleteSnapshots:         shouldDeleteSnapshots
      },
      amiBackup:            {
        shouldDeleteImages: shouldDeleteAmiBackupImages
      }
    },
    headers: {
      'Content-Type':  'application/json',
      'Authorization': 'Bearer ' + token,
      'User-Agent':    spotUtil.getUserAgent()
    }
  };
  
  console.log("Sending Delete: " + JSON.stringify(deleteOptions, null, 2))
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
        return util.done(err, event, context, spotResponse.body);
      },
      failureCb: function(spotResponse) {
        console.log("Can't delete group, check if the group even exists");
        spotUtil.validateGroup(refId, token, event, context);
      }
    });
  });
  
};

function getDeletePolicyConfig(event) {
  var deletePolicy = _.get(event, 'ResourceProperties.deletePolicy') || _.get(event, 'deletePolicy');
  return deletePolicy;
};

async function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * This function gets all the elastigroups in the user account and checks that
 * the group tags match the auto generated tags and returns the group id for
 * the match
 *
 * @function
 * @name getElastigroupFromTags
 *
 * @param {Object} cb - Callback function
 */
function getElastigroupFromTags(event, token) {
  return new Promise((resolve, reject) => {
    let autoTags = spotUtil.generateTags(event)
    console.log("autoTags: " + JSON.stringify(autoTags, null, 2))
    
    var getAllGroupsOptions = {
      url:     "https://api.spotinst.io/aws/ec2/group",
      method:  "GET",
      qs:      {
        accountId: spotUtil.getSpotinstAccountId(event)
      },
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + token,
        'User-Agent':    spotUtil.getUserAgent()
      }
    }
    
    let getAllGroups = (cb, er) => {
      request(getAllGroupsOptions, function(err, res, body) {
        spotUtil.validateResponse({
          err:       err,
          res:       res,
          body:      body,
          event:     event,
          context:   {},
          resource:  'elastigroup',
          action:    'get-all',
          successCb: function(spotResponse) {
            if(typeof body === "string") {
              body = JSON.parse(body);
            }
            
            let groups = body.response.items
            
            groups.forEach((singleGroup) => {
              let tags = singleGroup.compute.launchSpecification.tags
              if(_.find(tags, autoTags[0]) && _.find(tags, autoTags[1]) && _.find(tags, autoTags[2])) {
                console.log(`${singleGroup.id} group found by tags`)
                cb(null, singleGroup.id)
              }
            })
            
            cb("elastigroup not found from tags")
          },
          failureCb: function(spotResponse) {
            cb(spotResponse.errMsg)
          }
        })
      })
    }
    
    async.retry({
      times:    7,
      interval: 1000
    }, getAllGroups, (err, res) => {
      if(err) {
        return reject(err)
      } else {
        return resolve(res)
      }
    })
  })
}

/* Do not change this function */
module.exports.handler = async function(event, context) {
  handler.apply(this, [event, context, destroy]);
};

