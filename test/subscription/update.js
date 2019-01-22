var _ = require('lodash'),
  assert = require('assert'),
  update = require('../../lib/resources/subscription/update'),
  subscription = require('../../lib/resources/subscription'),
  lambda = require('../../'),
  nock = require('nock'),
  sinon  = require('sinon'),
  util   = require('lambda-formation').util

var subscriptionConfig = {
  "subscription": {
    "resourceId": "sis-11111111",
    "protocol": "http",
    "endpoint": "http://fakeurl.io",
    "eventType": "AWS_EC2_INSTANCE_TERMINATE"
  }
}

describe("subscription", function() {
  beforeEach(()=>{
    nock.cleanAll();
    sandbox = sinon.createSandbox();
  })

  afterEach(()=>{
    sandbox.restore()
  });

  describe("update", function() {

    it("update handler should update an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .put('/events/subscription/sis-11111111', {"subscription":{"resourceId":"sis-11111111","protocol":"http","endpoint":"http://fakeurl.io","eventType":"AWS_EC2_INSTANCE_TERMINATE"}})
      .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null);
        done();
      })

      update.handler(
        _.merge({
          id: 'sis-11111111',
          accessToken: ACCESSTOKEN
        },subscriptionConfig),
        null
      );
    });

    it("subscription handler should update an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .put('/events/subscription/sis-11111111', {"subscription":{"resourceId":"sis-11111111","protocol":"http","endpoint":"http://fakeurl.io","eventType":"AWS_EC2_INSTANCE_TERMINATE"}})
      .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null);
        done();
      })

      update.handler(
        _.merge({
          id: 'sis-11111111',
          requestType: 'update',
          accessToken: ACCESSTOKEN
        },subscriptionConfig),
        null
      );
    });

    it("lambda handler should update an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .put('/events/subscription/sis-11111111', {"subscription":{"resourceId":"sis-11111111","protocol":"http","endpoint":"http://fakeurl.io","eventType":"AWS_EC2_INSTANCE_TERMINATE"}})
      .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null);
        done();
      })

      update.handler(
        _.merge({
          id: 'sis-11111111',
          resourceType: 'subscription',
          requestType: 'update',
          accessToken: ACCESSTOKEN
        },subscriptionConfig),
        null
      );
    });

    it("return error from spotUtil.getTokenAndConfig", function(done){

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.notEqual(err, null);
        done();
      })

      var updatePolicyConfig = {
        shouldRoll: false,
        rollConfig: {
          batchSizePercentage: 50,
          gracePeriod:         600
        }
      };

      update.handler(
        _.merge({
          id:           'sig-11111111',
          updatePolicy: updatePolicyConfig
        }, subscriptionConfig),
        context
      );
    })
  });
});
