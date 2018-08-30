var handler  = require('lambda-formation').resource.update;
var util     = require('lambda-formation').util;

/**
 * This function creates an elastigroup from an exsisting ASG using the import ASG API call
 *
 * @function
 * @name getASGName
 *
 * @param {Object} err - Err data from Lambda
 * @param {Object} event - Event data from Lambda
 * @param {Object} context - Context data from Lambda
 *
 * @property {String} asg name string 
 */
function update(err, event, context) {

  return util.done("This resource cannot be Updated", event, context);
}

/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, update]);
};


