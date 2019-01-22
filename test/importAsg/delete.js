var assert       = require('assert'),
    deleteAsg  = require('../../lib/resources/importAsg/delete'),
    importAsg = require('../../lib/resources/importAsg'),
    lambda       = require('../../'),
    nock         = require('nock'),
    sinon     = require('sinon'),
    util      = require('lambda-formation').util;

describe("importAsg", function() {
  beforeEach(()=>{
      nock.cleanAll();
      sandbox = sinon.createSandbox();
  })

  afterEach(()=>{
      sandbox.restore()
  });

  describe("delete resource", function() {
    it("delete handler should delete an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
      .delete('/aws/ec2/group/sig-11111111')
      .reply(200, {"request":  {},"response": {"status": {"code":    200,"message": "OK"}}});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      deleteAsg.handler({
        accessToken: ACCESSTOKEN,
        id:          'sig-11111111'
      }, context);
    });

    it("importAsg handler should delete an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
      .delete('/aws/ec2/group/sig-11111111')
      .reply(200, {"request":  {},"response": {"status": {"code":    200,"message": "OK"}}});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      importAsg.handler({
        requestType: 'delete',
        accessToken: ACCESSTOKEN,
        id:          'sig-11111111'
      }, context);
    });

    it("lambda handler should delete an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
      .delete('/aws/ec2/group/sig-11111111')
      .reply(200, {"request":  {},"response": {"status": {"code":    200,"message": "OK"}}});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      lambda.handler({
        resourceType: 'importAsg',
        requestType:  'delete',
        accessToken:  ACCESSTOKEN,
        id:           'sig-11111111'
      }, context);
    });

    it("lambda handler should delete for CloudFormation", function(done) {

      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .delete('/aws/ec2/group/sig-11111111')
        .reply(200, {});

      nock('https://fake.url')
        .put('/', {
          "Status":            "SUCCESS",
          "Reason":            "See the details in CloudWatch Log Stream: undefined",
          "StackId":           "arn:aws:cloudformation:us-east-1:namespace:stack/stack-name/guid",
          "RequestId":         "unique id for this create request",
          "LogicalResourceId": "name of resource in template"
        })
        .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      lambda.handler({
          ResourceType:       'Custom::importAsg',
          ResourceProperties: {
            accessToken: ACCESSTOKEN,
          },
          RequestType:        "Delete",
          RequestId:          "unique id for this create request",
          ResponseURL:        "https://fake.url",
          LogicalResourceId:  "name of resource in template",
          PhysicalResourceId: 'sig-11111111',
          StackId:            "arn:aws:cloudformation:us-east-1:namespace:stack/stack-name/guid"
        },
        context);
    });

    // it("should scale ASG then delete", function(done) {
    //   nock("https://api.spotinst.io", {"encodedQueryParams": true})
    //   .post("/aws/ec2/group/sig-11111111/asgOperation/scaleOnce")
    //   .reply(200, {})

    //   nock('https://api.spotinst.io', {"encodedQueryParams": true})
    //   .delete('/aws/ec2/group/sig-11111111')
    //   .reply(200, {"request":  {},"response": {"status": {"code":    200,"message": "OK"}}});

    //   util.done = sandbox.spy((err, event, context, body)=>{
    //     assert.equal(err, null)
    //     done()
    //   })

    //   lambda.handler({
    //     resourceType: 'elasticgroup',
    //     requestType:  'delete',
    //     accessToken:  ACCESSTOKEN,
    //     id:           'sig-11111111',
    //     deletePolicy:{
    //       asgScaleTarget: 5
    //     },
    //     ResourceProperties:{
    //       accessToken:ACCESSTOKEN
    //     }
    //   }, context);
    // });
  });

  describe("delete resource fail", function() {
    describe("group exists", function() {
      it("should return error", function(done) {
        nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .delete('/aws/ec2/group/sig-11111111')
        .reply(400, {"request":  {},"response": {"status": {"code":    400,"message": "Bad Request"}}});

        nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .get('/aws/ec2/group/sig-11111111')
        .reply(200, {});

        util.done = sandbox.spy((err, event, context, body)=>{
          assert.notEqual(err, null)
          done()
        })


        deleteAsg.handler({
          accessToken: ACCESSTOKEN,
          id:          'sig-11111111'
        }, context);
      });
    });

    describe("group doesn't exists", function() {
      it("should return ok", function(done) {
        nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .delete('/aws/ec2/group/sig-11111111')
        .reply(400, {"request":  {},"response": {"status": {"code":    400,"message": "Bad Request"}}});

        nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .get('/aws/ec2/group/sig-11111111')
        .reply(400, {});

         util.done = sandbox.spy((err, event, context, body)=>{
          assert.equal(err, null)
          done()
        })

        deleteAsg.handler({
          accessToken: ACCESSTOKEN,
          id:          'sig-11111111'
        }, context);
      });
    });
  });
});
