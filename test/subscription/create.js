var _ = require('lodash'),
  assert = require('assert'),
  create = require('../../lib/resources/subscription/create'),
  subscription = require('../../lib/resources/subscription'),
  lambda = require('../../'),
  nock = require('nock'),
  sinon  = require('sinon'),
  util   = require('lambda-formation').util

var subscriptionConfig = {
  "subscription": {
    "resourceId": "sis-985aae92",
    "protocol": "aws-sns",
    "endpoint": "arn:aws:sns:us-east-1:546276914724:spotinst-test",
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

  describe("create resource", function() {

    it("create handler should create a new subscription", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .post('/events/subscription', subscriptionConfig)
      .reply(200, {"request":{"id":"10ad8a73-a848-4ca6-b99a-2ae8afac4ef3","url":"/events/subscription","method":"POST","timestamp":"2016-04-12T16:42:57.078Z"},"response":{"status":{"code":201,"message":"Created"},"kind":"spotinst:subscription","items":[{"id":"sis-b34f3bcb","resourceId":"sis-985aae92","protocol":"aws-sns","endpoint":"arn:aws:sns:us-east-1:546276914724:spotinst-test","eventType":"AWS_EC2_INSTANCE_TERMINATE","updatedAt":"2016-04-12T16:42:57.000Z","createdAt":"2016-04-12T16:42:57.000Z"}],"count":1}}, { 'access-control-allow-headers': 'Origin,Accept,Content-Type,X-Requested-With,X-CSRF-Token'});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null);
        done();
      })

      create.handler(
        _.merge({accessToken: ACCESSTOKEN}, subscriptionConfig),
        context
      );
    });

    it("subscription handler should create a new subscription", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .post('/events/subscription', subscriptionConfig)
      .reply(200, {"request":{"id":"10ad8a73-a848-4ca6-b99a-2ae8afac4ef3","url":"/events/subscription","method":"POST","timestamp":"2016-04-12T16:42:57.078Z"},"response":{"status":{"code":201,"message":"Created"},"kind":"spotinst:subscription","items":[{"id":"sis-b34f3bcb","resourceId":"sis-985aae92","protocol":"aws-sns","endpoint":"arn:aws:sns:us-east-1:546276914724:spotinst-test","eventType":"AWS_EC2_INSTANCE_TERMINATE","updatedAt":"2016-04-12T16:42:57.000Z","createdAt":"2016-04-12T16:42:57.000Z"}],"count":1}}, { 'access-control-allow-headers': 'Origin,Accept,Content-Type,X-Requested-With,X-CSRF-Token'});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null);
        done();
      })

      subscription.handler(
        _.merge({
          requestType: 'Create',
          accessToken: ACCESSTOKEN
        },subscriptionConfig),
        context
      );
    });

    it("lambda handler should create a new subscription", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .post('/events/subscription', subscriptionConfig)
      .reply(200, {"request":{"id":"10ad8a73-a848-4ca6-b99a-2ae8afac4ef3","url":"/events/subscription","method":"POST","timestamp":"2016-04-12T16:42:57.078Z"},"response":{"status":{"code":201,"message":"Created"},"kind":"spotinst:subscription","items":[{"id":"sis-b34f3bcb","resourceId":"sis-985aae92","protocol":"aws-sns","endpoint":"arn:aws:sns:us-east-1:546276914724:spotinst-test","eventType":"AWS_EC2_INSTANCE_TERMINATE","updatedAt":"2016-04-12T16:42:57.000Z","createdAt":"2016-04-12T16:42:57.000Z"}],"count":1}}, { 'access-control-allow-headers': 'Origin,Accept,Content-Type,X-Requested-With,X-CSRF-Token'});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null);
        done();
      })

      lambda.handler(
        _.merge({
          resourceType: 'subscription',
          requestType: 'Create',
          accessToken: ACCESSTOKEN
        }, subscriptionConfig),
        context
      );
    });

    it("lambda handler should create a new subscription from CloudFormation", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .post('/events/subscription', subscriptionConfig)
      .reply(200, {"request":{"id":"10ad8a73-a848-4ca6-b99a-2ae8afac4ef3","url":"/events/subscription","method":"POST","timestamp":"2016-04-12T16:42:57.078Z"},"response":{"status":{"code":201,"message":"Created"},"kind":"spotinst:subscription","items":[{"id":"sis-b34f3bcb","resourceId":"sis-985aae92","protocol":"aws-sns","endpoint":"arn:aws:sns:us-east-1:546276914724:spotinst-test","eventType":"AWS_EC2_INSTANCE_TERMINATE","updatedAt":"2016-04-12T16:42:57.000Z","createdAt":"2016-04-12T16:42:57.000Z"}],"count":1}}, { 'access-control-allow-headers': 'Origin,Accept,Content-Type,X-Requested-With,X-CSRF-Token'});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null);
        done();
      })

      lambda.handler({
        ResourceType: 'Custom::subscription',
        RequestType: 'Create',
        ResourceProperties: _.merge({accessToken: ACCESSTOKEN},subscriptionConfig)
      },
      context
                    );
    });

    it("return error from spotUtil.getTokenAndConfigs", function(done){
      util.done = sandbox.spy((err, event, context, body)=>{
        assert.notEqual(err, null);
        done();
      })

      create.handler(
        _.merge({
          id:           'sig-11111111',
        }, subscriptionConfig),
        context
      );
    })
  });
});
