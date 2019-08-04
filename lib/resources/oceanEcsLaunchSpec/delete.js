"use strict";

var handler  = require('lambda-formation').resource.create;
var util     = require('lambda-formation').util;
var request  = require('request');
var spotUtil = require('../../util');
var _        = require('lodash');
var async    = require('async')

/**
 * This function deletes an ocean launch spec that was created from an exsisting CF template using the delete ocean API call
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

	spotUtil.getToken(event, function(err, token) {
		if(err) return util.done(err, event, context);

		var refId = event.id || event.PhysicalResourceId;

		let oceanDeleteOptions = {
			uri:     "https://api.spotinst.io/ocean/aws/ecs/launchSpec/" + refId,
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

		console.log(`Deleting ocean ECS launch spec ${refId}`)

		request(oceanDeleteOptions, function(err, res, body) {
			spotUtil.validateResponse({
				err:       err,
				res:       res,
				body:      body,
				event:     event,
				context:   context,
				resource:  'ocean ECS launch spec',
				action:    'delete',
				successCb: function(spotResponse) {
					if(typeof body == "string"){
						body = JSON.parse(body)
					}
					console.log("Delete Ocean ECS launch spec Success: " + JSON.stringify(spotResponse, null, 2))
					util.done(null, event, context, body);
				}
			});
		});
	})
}

/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, destroy]);
};

