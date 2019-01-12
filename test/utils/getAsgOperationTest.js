var assert = require('assert'),
  util = require('../../lib/util');


describe("util getAsgOperation", function() {
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