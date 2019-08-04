"use strict";

let handler   = require('lambda-formation').resource.create;
let util      = require('lambda-formation').util;
let request   = require('request');
let spotUtil  = require('../../util');


/**
 * This function creates an ocean cluster based on the CF template
 *
 * @function
 * @name create
 *
 * @param {Object} err - Err data from Lambda
 * @param {Object} event - Event data from Lambda
 * @param {Object} context - Context data from Lambda
 */
function create(err, event, context) {
 	spotUtil.getTokenAndConfig(event, function(err, tc) {
		if(err) {
			return util.done(err, event, context);
		}

		let oceanClusterConfig  = tc.config;

		let createOceanOptions = {
			uri:     "https://api.spotinst.io/ocean/aws/ecs/cluster",
			method:  "POST",
			qs:      {
				accountId      : spotUtil.getSpotinstAccountId(event)
			},
			headers: {
				'Content-Type' : 'application/json',
				'Authorization': 'Bearer ' + tc.token,
				'User-Agent'   : spotUtil.getUserAgent()
			},
			json:    {
				cluster: oceanClusterConfig
			}
		};

		console.log('Creating ocean ECS cluster: ' + JSON.stringify(oceanClusterConfig, null, 2))

		request(createOceanOptions,function(err, res, body) {
			spotUtil.validateResponse({
				err:       err,
				res:       res,
				body:      body,
				event:     event,
				context:   context,
				resource:  'oceanEcs',
				action:    'create',
				successCb: function(spotResponse) {
					console.log('Ocean ECS Creation Success: ' + JSON.stringify(body, null, 2));

					let physicalResourceId = body.response.items[0].id;

					let options = {
						cfn_responder: {
							returnError: false,
							logLevel:    "debug"
						}
					};

					util.done(null, event, context, null, physicalResourceId, options);
				}
			})
		})
	})
}


/* Do not change this function */
module.exports.handler = function(event, context) {
	handler.apply(this, [event, context, create]);
};

