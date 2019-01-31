var _ = require('lodash');
var request  = require('request');
var spotUtil = require('../../../util');


/**
 * This function gets the region that is input from the CF template
 *
 * @function
 * @name getRegion
 *
 * @param {Object} event - Event data from lambda
 *
 * @property {String} region string
 */
module.exports.getRegion = function(event) {
  var region = _.get(event, 'ResourceProperties.region') || _.get(event, 'region');
  console.log('asg region: ', region);
  return region;
};

/**
 * This function gets the groupConfig from CF template
 *
 * @function
 * @name getGroupConfig
 *
 * @param {Object} event - Event data from lambda
 *
 * @property {String} region string
 */
module.exports.getGroupConfig = function(event) {	
  var groupConfig = _.get(event, 'ResourceProperties.groupConfig') || _.get(event, 'groupConfig') || false;
  console.log('groupConfig: ', groupConfig);
  return groupConfig;
};

/**
 * This function gets the delete policy from the CF template. Usually 'Retain' if you want to keep
 * the elastigroup after CF is deleted or nothing if you want them both deleted together
 *
 * @function
 * @name getASGName
 *
 * @param {Object} event - Event data from Lambda
 *
 * @property {String} delete policy 
 */
module.exports.getDeletePolicyConfig = function(event) {
  var deletePolicy = _.get(event, 'ResourceProperties.deletePolicy') || _.get(event, 'deletePolicy');
  return deletePolicy;
};



