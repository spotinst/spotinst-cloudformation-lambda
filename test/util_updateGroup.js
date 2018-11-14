var _ = require('lodash'),
  assert = require('assert'),
  nock = require('nock');
  util = require('../lib/util');


var event = {accountId:"act-12345"}

var token = "1234567890987654321"

var body = {}

var groupConfig = {
  event : event, 
  context : {}, 
  updatePolicy : {}, 
  refId : "sig-12345", 
  token: token, 
  body: body
}

describe("util updateGroup", function() {

  it("should update group without error", function(done) {
    nock('https://api.spotinst.io', {reqheaders: {'Authorization': `Bearer ${token}`}})
      .put('/aws/ec2/group/sig-12345?accountId=act-12345')
      .reply((uri, requestBody)=>{
        console.log("in the update reply")
        console.log(requestBody)
        assert.deepEqual(requestBody, {group:body})

        return(200, {test:true})
      });

    groupConfig.context = {done:done}

    util.updateGroup(groupConfig);
  });

});