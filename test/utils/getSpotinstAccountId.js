var _ = require('lodash'),
  assert = require('assert'),
  util = require('../../lib/util'),
  nock         = require('nock'),
  sinon        = require('sinon');


describe("util getSpotinstAccountId", function() {
  beforeEach(()=>{
      nock.cleanAll();
      sandbox = sinon.createSandbox();
  })

  afterEach(()=>{
      sandbox.restore()
  });

  it("should get account id without error", function(done) {

    event = {accountId:"act-12345"}

    assert.equal(util.getSpotinstAccountId(event), "act-12345")
    done()    
  });

});