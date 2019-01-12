var _ = require('lodash'),
  assert = require('assert'),
  nock = require('nock');
  util = require('../../lib/util');


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
        assert.deepEqual(requestBody, {group:body})

        return(200, {test:true})
      });

    groupConfig.context = {done:done}

    util.updateGroup(groupConfig);
  });

  it("should update group that already has tags and add autotags", function(done) {
    groupConfig.body = {compute:{launchSpecification:{tags:[{"one":"tag"}]}}}

    let outputTest = [
      {
        "one": "tag"
      },
      {
        "tagKey": "spotinst:aws:cloudformation:logical-id"
      },
      {
        "tagKey": "spotinst:aws:cloudformation:stack-id",
        "tagValue": "test1/test2/test3"
      },
      {
        "tagKey": "spotinst:aws:cloudformation:stack-name",
        "tagValue": "test2"
      }
    ]

    nock('https://api.spotinst.io', {reqheaders: {'Authorization': `Bearer ${token}`}})
      .put('/aws/ec2/group/sig-12345?accountId=act-12345')
      .reply((uri, requestBody)=>{
        assert.deepEqual(requestBody.group.compute.launchSpecification.tags, outputTest)

        return(200, {test:true})
      });

    groupConfig.event.StackId = "test1/test2/test3"
    groupConfig.event.autoTag = true
    groupConfig.context       = {done:done()}

    util.updateGroup(groupConfig);
  });

  it("should update group that does not already have tags and add autotags", function(done) {
    groupConfig.body = {compute:{launchSpecification:{}}}

    let outputTest = [
      {
        "tagKey": "spotinst:aws:cloudformation:logical-id"
      },
      {
        "tagKey": "spotinst:aws:cloudformation:stack-id",
        "tagValue": "test1/test2/test3"
      },
      {
        "tagKey": "spotinst:aws:cloudformation:stack-name",
        "tagValue": "test2"
      }
    ]

    nock('https://api.spotinst.io', {reqheaders: {'Authorization': `Bearer ${token}`}})
      .put('/aws/ec2/group/sig-12345?accountId=act-12345')
      .reply((uri, requestBody)=>{
        assert.deepEqual(requestBody.group.compute.launchSpecification.tags, outputTest)

        return(200, {test:true})
      });

    groupConfig.event.StackId = "test1/test2/test3"
    groupConfig.event.autoTag = true
    groupConfig.context = {done:done()}

    util.updateGroup(groupConfig);
  });

});