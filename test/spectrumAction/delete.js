var assert = require('assert'),
  deleteGroup = require('../../lib/resources/spectrumAction/delete'),
  spectrumAction = require('../../lib/resources/spectrumAction'),
  lambda = require('../../'),
  nock = require('nock'),
  sinon  = require('sinon'),
  util   = require('lambda-formation').util

describe("spectrumAction", function() {
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
      .delete('/spectrum/metrics/action/ac-ef459eb22456')
      .reply(200,{});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.ifError(err);
        done();
      })

      deleteGroup.handler({
        accessToken: ACCESSTOKEN,
        id: 'ac-ef459eb22456'
      },context);
    });

    it("spectrumAction handler should delete an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .delete('/spectrum/metrics/action/ac-ef459eb22456')
      .reply(200,{});

      util.done = sandbox.spy((err, event, context, body)=>{
          assert.ifError(err);
          done();
        })

      spectrumAction.handler({
        requestType: 'delete',
        accessToken: ACCESSTOKEN,
        id: 'ac-ef459eb22456'
      },context);
    });

    it("lambda handler should delete an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .delete('/spectrum/metrics/action/ac-ef459eb22456')
      .reply(200,{});

      util.done = sandbox.spy((err, event, context, body)=>{
          assert.ifError(err);
          done();
        })

      lambda.handler({
        resourceType: 'spectrumAction',
        requestType: 'delete',
        accessToken: ACCESSTOKEN,
        id: 'ac-ef459eb22456'
      },context);
    });

    it("lambda handler should delete for CloudFormation", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .delete('/spectrum/metrics/action/ac-ef459eb22456')
      .reply(200, {});

      nock('https://fake.url')
      .put('/', {"Status":"SUCCESS","Reason":"See the details in CloudWatch Log Stream: undefined","StackId":"arn:aws:cloudformation:us-east-1:namespace:stack/stack-name/guid","RequestId":"unique id for this create request","LogicalResourceId":"name of resource in template"})
      .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.ifError(err);
        done();
      })

      lambda.handler({
        ResourceType: 'Custom::spectrumAction',
        ResourceProperties: {
          accessToken: ACCESSTOKEN,
        },
        RequestType: "Delete",
        RequestId: "unique id for this create request",
        ResponseURL: "https://fake.url",
        LogicalResourceId: "name of resource in template",
        PhysicalResourceId: 'ac-ef459eb22456',
        StackId: "arn:aws:cloudformation:us-east-1:namespace:stack/stack-name/guid"
      },context);
    });
  });
});
