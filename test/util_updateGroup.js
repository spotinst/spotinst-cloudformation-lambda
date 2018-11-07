var _ = require('lodash'),
  assert = require('assert'),
  nock = require('nock');
  util = require('../lib/util');


var event = {accountId:"act-12345"}

var groupConfig = {event : event, context : {}, updatePolicy : {}, refId : "sig-12345", tc: {token:"1234567890987654321"}, body: {}}


describe("util updateGroup", function() {

  it("should update group without error", function(done) {
    nock('https://api.spotinst.io')
      .put('/aws/ec2/group/sig-12345?accountId=act-12345')
      .reply(200, {});

    groupConfig.context = {done:done}

    util.updateGroup(groupConfig);
  });

});