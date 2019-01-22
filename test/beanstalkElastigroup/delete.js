var assert       = require('assert'),
    deleteGroup  = require('../../lib/resources/beanstalkElastigroup/delete'),
    elasticgroup = require('../../lib/resources/beanstalkElastigroup'),
    lambda       = require('../../'),
    nock         = require('nock'),
    sinon        = require('sinon'),
    util         = require('lambda-formation').util;

describe("beanstalkElastigroup", function() {
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
        .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
          assert.equal(err, null)
          done()
      })

      deleteGroup.handler({
        accessToken: ACCESSTOKEN,
        id:          'sig-11111111',
      }, null);
    });

    it("elasticgroup handler should delete an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .delete('/aws/ec2/group/sig-11111111')
        .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
          assert.equal(err, null)
          done()
      })

      elasticgroup.handler({
        requestType: 'delete',
        accessToken: ACCESSTOKEN,
        id:          'sig-11111111'
      }, null);
    });

    it("lambda handler should delete an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .delete('/aws/ec2/group/sig-11111111')
        .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
          assert.equal(err, null)
          done()
      })

      lambda.handler({
        resourceType: 'elasticgroup',
        requestType:  'delete',
        accessToken:  ACCESSTOKEN,
        id:           'sig-11111111'
      }, null);
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
          ResourceType:       'Custom::elasticgroup',
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
        null);
    });
  });

  describe("delete resource fail", function() {
    describe("group exists", function() {
      it("should return error", function(done) {
        nock('https://api.spotinst.io', {"encodedQueryParams": true})
          .delete('/aws/ec2/group/sig-11111111')
          .reply(400, {});

        nock('https://api.spotinst.io', {"encodedQueryParams": true})
          .get('/aws/ec2/group/sig-11111111')
          .reply(200, {});

         util.done = sandbox.spy((err, event, context, body)=>{
            assert.notEqual(err, null)
            done()
        })

        deleteGroup.handler({
          accessToken: ACCESSTOKEN,
          id:          'sig-11111111'
        }, null);
      });
    });

    describe("group doesn't exists", function() {
      it("should return ok", function(done) {
        nock('https://api.spotinst.io', {"encodedQueryParams": true})
          .delete('/aws/ec2/group/sig-11111111')
          .reply(400, {});

        nock('https://api.spotinst.io', {"encodedQueryParams": true})
          .get('/aws/ec2/group/sig-11111111')
          .reply(400, {});

        util.done = sandbox.spy((err, event, context, body)=>{
          assert.equal(err, null)
          done()
        })

        deleteGroup.handler({
          accessToken: ACCESSTOKEN,
          id:          'sig-11111111'
        }, null);
      });
    });
  });
});
