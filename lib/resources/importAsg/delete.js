var handler  = require('lambda-formation').resource.delete;

/* Do not change this function */
module.exports.handler = function(event, context) {
  handler.apply(this, [event, context, require('../../util').destroy]);
};

