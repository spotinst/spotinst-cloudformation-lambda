var assert = require('assert'),
  util = require('../../lib/util'),
  nock         = require('nock'),
  sinon        = require('sinon');


describe("util getAsgOperation", function() {
    beforeEach(()=>{
      nock.cleanAll();
      sandbox = sinon.createSandbox();
  })

  afterEach(()=>{
      sandbox.restore()
  });

  var event = {
  	asgOperation:{
  		asgTarget: "3",
  		elastigroupThreshold: "5"
  	}
  }

  it("should get asg operation config", function() {
    var asgConfig = util.getAsgOperation(event);
    assert.deepEqual(asgConfig, { asgTarget: 3, elastigroupThreshold: 5 });
  });

});