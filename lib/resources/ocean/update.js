"use strict";

var handler  = require('lambda-formation').resource.create;
var util     = require('lambda-formation').util;
var request  = require('request');
var spotUtil = require('../../util');
var _        = require('lodash');

/**
 * This function updates an ocean cluster 
 *
 * @function
 * @name update
 *
 * @param {Object} err - Err data from Lambda
 * @param {Object} event - Event data from Lambda
 * @param {Object} context - Context data from Lambda
 *
 * @property {String} asg name string 
 */
function update(err, event, context) {
 	spotUtil.getTokenAndConfig(event, function(err, tc) {
		if(err) {
			return util.done(err, event, context);
		}
		let refId               = event.id || event.PhysicalResourceId;
		let oceanUpdateConfig   = tc.config;

		_.unset(oceanUpdateConfig, 'region')

		let updatePolicy = spotUtil.getUpdatePolicyConfig(event) || {};
		let shouldUpdateTargetCapacity = spotUtil.parseBoolean(updatePolicy.shouldUpdateTargetCapacity);

		if(shouldUpdateTargetCapacity === false) {
			_.unset(oceanUpdateConfig, 'capacity.target');
		}

		if(spotUtil.checkAutoTag(event)){
			let autoTags = spotUtil.generateTags(event)
			if(spotUtil.tagsExsist(oceanUpdateConfig)){
				autoTags.forEach((singleTag)=>{
					oceanUpdateConfig.compute.launchSpecification.tags.push(singleTag)
				})
			}else{
				oceanUpdateConfig.compute.launchSpecification.tags = autoTags
			}
		}

		let updateOceanOptions = {
			uri :     "https://api.spotinst.io/ocean/aws/k8s/cluster/" + refId,
			method :  "PUT",
			qs :      {
				accountId      : spotUtil.getSpotinstAccountId(event),
			},
			headers : {
				'Content-Type' : 'application/json',
				'Authorization': 'Bearer ' + tc.token,
				'User-Agent'   : spotUtil.getUserAgent()
			},
			json :    {
				cluster: oceanUpdateConfig
			}
		}

		console.log('Update ocean K8S cluster: ' + JSON.stringify(oceanUpdateConfig, null, 2))
	 
		request(updateOceanOptions, function(err, res, body) {
			spotUtil.validateResponse({
				err:       err,
				res:       res,
				body:      body,
				event:     event,
				context:   context,
				resource:  'ocean',
				action:    'update',
				successCb: function(spotResponse) {
					console.log('Ocean K8S Update Success: ' + JSON.stringify(body, null, 2));
					
					let options = {
						cfn_responder: {
							returnError: false,
							logLevel:    "debug"
						}
					};

					util.done(null, event, context, null, refId, options);
				}
			})
		})
		
		let shouldRoll = spotUtil.parseBoolean(updatePolicy.shouldRoll);
		if(shouldRoll === true) {

			spotUtil.rollCluster({
				event        : event,
				context      : context,
				updatePolicy : updatePolicy,
				refId        : refId,
				token        : tc.token,
				body         : updatePolicy.rollConfig
			})
		}
	})
}


/* Do not change this function */
module.exports.handler = function(event, context) {
	handler.apply(this, [event, context, update]);
};

