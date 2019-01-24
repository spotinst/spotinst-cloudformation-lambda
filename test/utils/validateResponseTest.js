var assert = require('assert'),
  util = require('../../lib/util'),
  nock         = require('nock'),
  sinon        = require('sinon');


describe("util validateResponseTest", function() {
  beforeEach(()=>{
      nock.cleanAll();
      sandbox = sinon.createSandbox();
  })

  afterEach(()=>{
      sandbox.restore()
  });

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


    utilSpy.done = sandbox.spy((err)=>{
      assert.equal(err, "test action failed: Validation Failed")
      done()
    })

    util.validateResponse(spotResponse);
  });

});