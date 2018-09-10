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
 * This function gets the asg name that is input from the CF template
 *
 * @function
 * @name getASGName
 *
 * @param {Object} event - Event data from lambda
 *
 * @property {String} asg name string 
 */
module.exports.getASGName = function(event) {
  var asgName = _.get(event, 'ResourceProperties.asgName') || _.get(event, 'asgName');
  console.log('asg name is: ', asgName);
  return asgName;
};

/**
 * This function gets the dry run that is input from CF template. If none given set to false
 *
 * @function
 * @name getDryRun
 *
 * @param {Object} event - Event data from lambda
 *
 * @property {Bool} 
 */
module.exports.getDryRun = function(event) {
  var dryRun = _.get(event, 'ResourceProperties.dryRun') || _.get(event, 'dryRun') || false;
  console.log('dry run is: ', dryRun);
  return dryRun;
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

