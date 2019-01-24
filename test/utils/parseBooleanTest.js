var assert = require('assert'),
  util = require('../../lib/util'),
  nock         = require('nock'),
  sinon        = require('sinon');


describe("util parseBoolean", function() {
  beforeEach(()=>{
      nock.cleanAll();
      sandbox = sinon.createSandbox();
  })

  afterEach(()=>{
      sandbox.restore()
  });

  it("should parse boolean true", function() {

    var parsedBoolean = util.parseBoolean("true");
    assert.equal(parsedBoolean, true);
  });

  it("should parse boolean false", function() {

    var parsedBoolean = util.parseBoolean("false");
    assert.equal(parsedBoolean, false);
  });
});