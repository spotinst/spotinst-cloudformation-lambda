var assert = require('assert'),
  util = require('../../lib/util');


describe("util validateResponseTest", function() {

  let spotResponse = {
  	res:{},
  	body:{},
  	event:{},
  	context:{},
  	err:{}
  }

  it("should fail validation without a failure cb", function(done) {
  	spotResponse.res.statusCode = "Validation Failed"
  	spotResponse.err = "failed!"
  	spotResponse.resource = "test"
  	spotResponse.action = "action"

  	spotResponse.context = {
  		done: (err)=>{
  			assert.equal(err, "test action failed: Validation Failed")
  			done()
  		}
  	}

    util.validateResponse(spotResponse);
  });

});