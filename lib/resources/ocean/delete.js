"use strict";

var handler  = require('lambda-formation').resource.create;
var util     = require('lambda-formation').util;
var request  = require('request');
var spotUtil = require('../../util');
var _        = require('lodash');
var async = require('async')

/**
 * This function deletes an ocean that was created from an existing CF template using the delete ocean API call
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

	let token = await spotUtil.getTokenAsync({event:event,context:context})
		.catch((err)=>{
			return util.done(err, event, context, {});
		})

	var refId = event.id || event.PhysicalResourceId;

	if(refId == "ResourceFailed"){
		console.log("rolling back")
		return util.done(null, event, context);
	}

	if(spotUtil.checkAutoTag(event)){
		refId = await getClusterFromTags(event, token)
			.catch((err)=>{
				console.log(err)
				return util.done(err, event, context, {});
			})
	}

	let oceanDeleteOptions = {
		uri:     "https://api.spotinst.io/ocean/aws/k8s/cluster/" + refId,
		method:  "DELETE",
		qs:      {
			accountId      : spotUtil.getAccountId(event)
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
				if(typeof body == "string"){
					body = JSON.parse(body)
				}
				console.log("Delete Success: " + JSON.stringify(spotResponse, null, 2))
				util.done(null, event, context, body);
			},
			failureCb: function(spotResponse) {
				console.log("Can't delete ocean cluster, check if the cluster even exists");
				spotUtil.validateOceanCluster(refId, token, event, context);
			}
		});
	});
}

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

    console.log("AutoTags: " + JSON.stringify(autoTags, null, 2))
    var getAllClusterOptions = {
      url:    "https://api.spotinst.io/ocean/aws/k8s/cluster",
      method: "GET",
      qs:     {
				accountId: spotUtil.getAccountId(event),
				...spotUtil.getParameters(event),
      },
      headers:{
          'Content-Type' : 'application/json',
          'Authorization': 'Bearer ' + token,
          'User-Agent'   : spotUtil.getUserAgent()
      }
    }

	console.log('Getting All Ocean Clusters: ' + JSON.stringify(getAllClusterOptions, null, 2));

    let getAllGroups = (cb, err) =>{
		request(getAllClusterOptions, function(err, res, body){
			spotUtil.validateResponse({
				err:       err,
				res:       res,
				body:      body,
				event:     event,
				context:   null,
				resource:  'ocean',
				action:    'get-all',
				successCb: function(spotResponse) {
					if(typeof body == "string"){
						body = JSON.parse(body)
					}
					let groups = body.response.items

					groups.forEach((singleGroup)=>{
					let tags = singleGroup.compute.launchSpecification.tags

						if(_.find(tags, autoTags[0]) && _.find(tags, autoTags[1]) && _.find(tags, autoTags[2])){
							console.log("ocean found from tags: " + singleGroup.id)
							cb(null, singleGroup.id)
						}
					})

					cb("ocean cluster not found from tags")
				},
				failureCb: function(spotResponse){
					cb(spotResponse.errMsg);
				}
			})
		})
    }

    async.retry({times: 5, interval: 1000}, getAllGroups, (err, res)=>{
      if(err){
        return reject(err)
      }else{
        return resolve(res)
      }
    })
  })
}

/* Do not change this function */
module.exports.handler = function(event, context) {
	handler.apply(this, [event, context, destroy]);
};

