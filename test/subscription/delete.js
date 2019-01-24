var assert = require('assert'),
  deleteGroup = require('../../lib/resources/subscription/delete'),
  subscription = require('../../lib/resources/subscription'),
  lambda = require('../../'),
  sinon  = require('sinon'),
  nock         = require('nock'),
  util   = require('lambda-formation').util

describe("subscription", function() {
  beforeEach(()=>{
    nock.cleanAll();
    sandbox = sinon.createSandbox();
  })

  afterEach(()=>{
    sandbox.restore()
  });

  describe("delete resource", function() {
    it("delete handler should delete an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .delete('/events/subscription/sis-11111111')
      .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null);
        done();
      })

      deleteGroup.handler({
        accessToken: ACCESSTOKEN,
        id: 'sis-11111111'
      },context);
    });

    it("subscription handler should delete an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .delete('/events/subscription/sis-11111111')
      .reply(200, {});


      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null);
        done();
      })

      subscription.handler({
        requestType: 'delete',
        accessToken: ACCESSTOKEN,
        id: 'sis-11111111'
      },context);
    });

    it("lambda handler should delete an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .delete('/events/subscription/sis-11111111')
      .reply(200, {});


      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null);
        done();
      })

      lambda.handler({
        resourceType: 'subscription',
        requestType: 'delete',
        accessToken: ACCESSTOKEN,
        id: 'sis-11111111'
      },context);
    });

    it("lambda handler should delete for CloudFormation", function(done) {

      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .delete('/events/subscription/sis-11111111')
      .reply(200, {});

      nock('https://fake.url')
      .put('/', {"Status":"SUCCESS","Reason":"See the details in CloudWatch Log Stream: undefined","StackId":"arn:aws:cloudformation:us-east-1:namespace:stack/stack-name/guid","RequestId":"unique id for this create request","LogicalResourceId":"name of resource in template"})
      .reply(200, {});


      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null);
        done();
      })

      lambda.handler({
        ResourceType: 'Custom::subscription',
        ResourceProperties: {
          accessToken: ACCESSTOKEN,
        },
        RequestType: "Delete",
        RequestId: "unique id for this create request",
        ResponseURL: "https://fake.url",
        LogicalResourceId: "name of resource in template",
        PhysicalResourceId: 'sis-11111111',
        StackId: "arn:aws:cloudformation:us-east-1:namespace:stack/stack-name/guid"
      },context);
    });
  });
});
