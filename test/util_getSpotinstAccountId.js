var _ = require('lodash'),
  assert = require('assert'),
  util = require('../lib/util');


describe("util getSpotinstAccountId", function() {

  it("should get account id without error", function(done) {

    event = {accountId:"act-12345"}

    assert.equal(util.getSpotinstAccountId(event), "act-12345")
    done()    
  });

});