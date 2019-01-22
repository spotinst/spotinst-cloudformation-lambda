var assert = require('assert'),
  deleteGroup = require('../../lib/resources/spectrumAlert/delete'),
  spectrumAlert = require('../../lib/resources/spectrumAlert'),
  lambda = require('../../'),
  nock = require('nock'),
  sinon  = require('sinon'),
  util   = require('lambda-formation').util

describe("spectrumAlert", function() {
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
      .delete('/spectrum/metrics/alert/al-76b3d4d8dabc')
      .reply(200,{});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.ifError(err);
        done();
      })

      deleteGroup.handler({
        accessToken: ACCESSTOKEN,
        id: 'al-76b3d4d8dabc'
      },context);
    });

    it("spectrumAlert handler should delete an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .delete('/spectrum/metrics/alert/al-76b3d4d8dabc')
      .reply(200,{});

      util.done = sandbox.spy((err, event, context, body)=>{
          assert.ifError(err);
          done();
        })

      spectrumAlert.handler({
        requestType: 'delete',
        accessToken: ACCESSTOKEN,
        id: 'al-76b3d4d8dabc'
      },context);
    });

    it("lambda handler should delete an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .delete('/spectrum/metrics/alert/al-76b3d4d8dabc')
      .reply(200,{});

     util.done = sandbox.spy((err, event, context, body)=>{
        assert.ifError(err);
        done();
      })

      lambda.handler({
        resourceType: 'spectrumAlert',
        requestType: 'delete',
        accessToken: ACCESSTOKEN,
        id: 'al-76b3d4d8dabc'
      },context);
    });

    it("lambda handler should delete for CloudFormation", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .delete('/spectrum/metrics/alert/al-76b3d4d8dabc')
      .reply(200, {});

      nock('https://fake.url')
      .put('/', {"Status":"SUCCESS","Reason":"See the details in CloudWatch Log Stream: undefined","StackId":"arn:aws:cloudformation:us-east-1:namespace:stack/stack-name/guid","RequestId":"unique id for this create request","LogicalResourceId":"name of resource in template"})
      .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
          assert.ifError(err);
          done();
        })

      lambda.handler({
        ResourceType: 'Custom::spectrumAlert',
        ResourceProperties: {
          accessToken: ACCESSTOKEN,
        },
        RequestType: "Delete",
        RequestId: "unique id for this create request",
        ResponseURL: "https://fake.url",
        LogicalResourceId: "name of resource in template",
        PhysicalResourceId: 'al-76b3d4d8dabc',
        StackId: "arn:aws:cloudformation:us-east-1:namespace:stack/stack-name/guid"
      },context);
    });
  });
});
