var assert = require('assert'),
  util = require('../../lib/util');


describe("util parseBoolean", function() {

  it("should parse boolean true", function() {

    var parsedBoolean = util.parseBoolean("true");
    assert.equal(parsedBoolean, true);
  });

  it("should parse boolean false", function() {

    var parsedBoolean = util.parseBoolean("false");
    assert.equal(parsedBoolean, false);
  });
});