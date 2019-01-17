"use strict";

var handler  = require('lambda-formation').resource.create;
var util     = require('lambda-formation').util;
var request  = require('request');
var spotUtil = require('../../util');
var _        = require('lodash');

var async = require('asyncawait/async');
var await = require('asyncawait/await');


/**
 * This function deletes an ocean that was created from an exsisting CF template using the delete ocean API call
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
	if(err) {
		return util.done(err);
	}
	spotUtil.getToken(event, function(err, token) {
		if(err) {
			return util.done(err, event, context);
		}

		var refId = event.id || event.PhysicalResourceId;

		if(refId == "ResourceFailed"){
			console.log("rolling back")
			util.done(null, event, context);
		}

		if(spotUtil.checkAutoTag(event)){
			try{
				refId = await(getClusterFromTags(event, token))
			}catch(err){
				console.log(err)
				util.done(err, event, context, {});
			}
		}

		let oceanDeleteOptions = {
			uri:     "https://api.spotinst.io/ocean/aws/k8s/cluster/" + refId,
			method:  "DELETE",
			qs:      {
				accountId      : spotUtil.getSpotinstAccountId(event)
			},
			headers: {
				'Content-Type' : 'application/json',
				'Authorization': 'Bearer ' + token,
				'User-Agent'   : spotUtil.getUserAgent()
			}
		}

		console.log(`Deleting ocean cluster ${refId}`)

		request(oceanDeleteOptions, function(err, res, body) {
			spotUtil.validateResponse({
				err:       err,
				res:       res,
				body:      body,
				event:     event,
				context:   context,
				resource:  'ocean',
				action:    'delete',
				successCb: function(spotResponse) {
					util.done(err, event, context, body);
				},
				failureCb: function(spotResponse) {
					console.log("Can't delete ocean cluster, check if the cluster even exists");
					spotUtil.validateGroup(refId, token, event, context);
				}
			});
		});

	})
})

/**
 * Gets an ocean cluster based on its tags if the auto tag flag is set to true
 *
 * @function
 * @name getClusterFromTags
 *
 * @param {Object} event - Event data from Lambda
 * @param {Object} token - token for spotinst api
 */
function getClusterFromTags(event, token){
  return new Promise((resolve, reject)=>{
    let autoTags = spotUtil.generateTags(event)

    var getAllClusterOptions = {
      url:    "https://api.spotinst.io/ocean/aws/k8s/cluster",
      method: "GET",
      qs:     {
        accountId        : spotUtil.getSpotinstAccountId(event)
      },
      headers:{
          'Content-Type' : 'application/json',
          'Authorization': 'Bearer ' + token,
          'User-Agent'   : spotUtil.getUserAgent()
      }
    }

    request(getAllClusterOptions, function(err, res, body){
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
      
      return reject("ocean cluster not found from tags")
    })
  })
}



/* Do not change this function */
module.exports.handler = function(event, context) {
	handler.apply(this, [event, context, destroy]);
};

