var assert = require('assert'),
    deleteGroup = require('../../lib/resources/elastigroup/delete'),
    elastigroup = require('../../lib/resources/elastigroup'),
    lambda = require('../../'),
    nock         = require('nock'),
    sinon     = require('sinon'),
    util      = require('lambda-formation').util;

describe("elastigroup", function () {
    beforeEach(()=>{
      nock.cleanAll();
      sandbox = sinon.createSandbox();
    })

    afterEach(()=>{
      sandbox.restore()
    });

    describe("delete resource", function () {
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
            id:          'sig-11111111'
          }, context);
        });

        it("elastigroup handler should delete an existing group", function(done) {
          nock('https://api.spotinst.io', {"encodedQueryParams": true})
            .delete('/aws/ec2/group/sig-11111111')
            .reply(200, {});

          util.done = sandbox.spy((err, event, context, body)=>{
            assert.equal(err, null)
            done()
          })

          elastigroup.handler({
            requestType: 'delete',
            accessToken: ACCESSTOKEN,
            id:          'sig-11111111'
          }, context);
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
          }, context);
        });

        it("lambda handler should delete for CloudFormation", function(done) {
          nock('https://api.spotinst.io', {"encodedQueryParams": true})
            .delete('/aws/ec2/group/sig-11111111')
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
            context);
        });
    });
});
