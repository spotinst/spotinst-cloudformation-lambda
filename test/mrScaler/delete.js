var assert       = require('assert'),
    deleteGroup  = require('../../lib/resources/mrScaler/delete'),
    mrScaler     = require('../../lib/resources/mrScaler'),
    lambda       = require('../../'),
    nock         = require('nock'),
    spotUtil     = require('../../lib/util'),
    sinon     = require('sinon'),
    util      = require('lambda-formation').util,
    mrScalerUtil = require("../../lib/resources/mrScaler/util")

describe("mrScaler delete resource", function() {
  beforeEach(()=>{
    nock.cleanAll();
    sandbox = sinon.createSandbox();
  })

  afterEach(()=>{
    sandbox.restore()
  });

  describe("mrScaler Delete Successful", function(){
    it("delete handler should delete an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .delete('/aws/emr/mrScaler/simrs-85e26ac5')
        .reply(200, {
          "request":  {
            "id":        "9bad8ebc-a42c-425f-83ab-fbec3b1cbd8a",
            "url":       "/aws/emr/mrScaler/simrs-85e26ac5",
            "method":    "DELETE",
            "timestamp": "2016-01-28T17:34:37.072Z"
          },
          "response": {
            "status": {
              "code":    200,
              "message": "OK"
            }
          }
        });

      util.done = sandbox.spy((err, event, context, body)=>{
      	console.log("this is the end of the delete")
        assert.equal(err, null);
        assert.equal(body.request.url, "/aws/emr/mrScaler/simrs-85e26ac5");
        done(err, body);
      })

      deleteGroup.handler({
        accessToken: ACCESSTOKEN,
        id:          'simrs-85e26ac5',
      }, context);
    });

    it("mrScaler handler should delete an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .delete('/aws/emr/mrScaler/simrs-85e26ac5')
        .reply(200, {
          "request":  {
            "id":        "9bad8ebc-a42c-425f-83ab-fbec3b1cbd8a",
            "url":       "/aws/emr/mrScaler/simrs-85e26ac5",
            "method":    "DELETE",
            "timestamp": "2016-01-28T17:34:37.072Z"
          },
          "response": {
            "status": {
              "code":    200,
              "message": "OK"
            }
          }
        });

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null);
        assert.equal(body.request.url, "/aws/emr/mrScaler/simrs-85e26ac5");
        done(err, body);
      })

      mrScaler.handler({
        requestType: 'delete',
        accessToken: ACCESSTOKEN,
        id:          'simrs-85e26ac5'
      }, context);
    });

    it("lambda handler should delete an existing group",  function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .delete('/aws/emr/mrScaler/simrs-85e26ac5')
        .reply(200, {
          "request":  {
            "id":        "9bad8ebc-a42c-425f-83ab-fbec3b1cbd8a",
            "url":       "/aws/emr/mrScaler/simrs-85e26ac5",
            "method":    "DELETE",
            "timestamp": "2016-01-28T17:34:37.072Z"
          },
          "response": {
            "status": {
              "code":    200,
              "message": "OK"
            }
          }
        });

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null);
        assert.equal(body.request.url, "/aws/emr/mrScaler/simrs-85e26ac5");
        done();
      })

      lambda.handler({
        resourceType: 'mrScaler',
        requestType:  'delete',
        accessToken:  ACCESSTOKEN,
        id:           'simrs-85e26ac5'
      }, null);
    });

    it("delete handler should delete an existing group and get token async", function(done) {
      nock('https://oauth.spotinst.io', {"encodedQueryParams": true})
        .post('/token')
        .reply(200, {response:{items:[{accessToken:ACCESSTOKEN}]}});

      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .delete('/aws/emr/mrScaler/simrs-85e26ac5')
        .reply(200, {
          "request":  {
            "id":        "9bad8ebc-a42c-425f-83ab-fbec3b1cbd8a",
            "url":       "/aws/emr/mrScaler/simrs-85e26ac5",
            "method":    "DELETE",
            "timestamp": "2016-01-28T17:34:37.072Z"
          },
          "response": {
            "status": {
              "code":    200,
              "message": "OK"
            }
          }
        });

      util.done = sandbox.spy((err, event, context, body)=>{
        console.log("this is the end of the delete")
        assert.equal(err, null);
        assert.equal(body.request.url, "/aws/emr/mrScaler/simrs-85e26ac5");
        done(err, body);
      })

      deleteGroup.handler({
        username:"test",
        password:"test",
        clientId:"test",
        clientSecret:"test",
        id: 'simrs-85e26ac5',
      }, context);
    });

    it("delete mrScaler cluster with autoTag set to true", function(done){
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .get('/aws/emr/mrScaler')
        .reply(200, {
          "request":  {"id": "9bad8ebc-a42c-425f-83ab-fbec3b1cbd8a","url": "/aws/emr/mrScaler/simrs-85e26ac5","method": "DELETE","timestamp": "2016-01-28T17:34:37.072Z"},
          "response": {"items":[{"id":"simrs-85e26ac5","compute":{"tags":[{"tagKey":"spotinst:aws:cloudformation:logical-id", "tagValue": "MrScaler"},{"tagKey":"spotinst:aws:cloudformation:stack-id"  , "tagValue": "arn::12345/test/67890"},{"tagKey":"spotinst:aws:cloudformation:stack-name", "tagValue": "test"}]}}]}
        });

      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .delete('/aws/emr/mrScaler/simrs-85e26ac5')
        .reply(200, {
          "request":  {"id": "9bad8ebc-a42c-425f-83ab-fbec3b1cbd8a","url": "/aws/emr/mrScaler/simrs-85e26ac5","method": "DELETE","timestamp": "2016-01-28T17:34:37.072Z"},
          "response": {"status": {"code":    200,"message": "OK"}}
        });

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.ifError(err);
        assert.equal(body.request.url, "/aws/emr/mrScaler/simrs-85e26ac5");
        done();
      })

      deleteGroup.handler({
        resourceType: 'mrScaler',
        requestType:  'delete',
        accessToken:  ACCESSTOKEN,
        id:           'MrScaler Error 9',
        autoTag:       true,
        LogicalResourceId:"MrScaler",
        StackId:"arn::12345/test/67890"
      }, null);      
    })

  })
  
  describe("mrScaler Delete Util Function Tests", function(){
    it("should return error from get token mrScaler", function(done) {
      util.done = sandbox.spy((err, event, context, body)=>{
        assert.notEqual(err, null);
        done();
      })

      deleteGroup.handler({
        id:          'simrs-85e26ac5'
      }, null);
    });

    it("should rollback not delete mrScaler", function(done){
      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(body, "ResourceFailed")
        done() 
      })

      deleteGroup.handler({
        accessToken: ACCESSTOKEN,
        StackId: "test",
        id:          'ResourceFailed'
      }, null);
    })

    it("mrScaler Delete Fails should return success group not found", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .delete('/aws/emr/mrScaler/simrs-85e26ac5')
        .reply(400, {
          "request":  {
            "id":        "9bad8ebc-a42c-425f-83ab-fbec3b1cbd8a",
            "url":       "/aws/emr/mrScaler/simrs-85e26ac5",
            "method":    "GET",
            "timestamp": "2016-01-28T17:34:37.072Z"
          },
          "response": {
            "status": {
              "code":    400,
              "message": "Bad Request"
            }
          }
        });

      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .get('/aws/emr/mrScaler/simrs-85e26ac5')
        .reply(400, '{"fail":"test"}');

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      deleteGroup.handler({
        accessToken: ACCESSTOKEN,
        id:          'simrs-85e26ac5'
      }, null);
    });
  })

  describe("mrScaler Delete Fails", function(){
    it("mrScaler Delete Fails should return error", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .delete('/aws/emr/mrScaler/simrs-85e26ac5')
        .reply(400, {
          "request":  {
            "id":        "9bad8ebc-a42c-425f-83ab-fbec3b1cbd8a",
            "url":       "/aws/emr/mrScaler/simrs-85e26ac5",
            "method":    "GET",
            "timestamp": "2016-01-28T17:34:37.072Z"
          },
          "response": {
            "status": {
              "code":    400,
              "message": "Bad Request"
            }
          }
        });

      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .get('/aws/emr/mrScaler/simrs-85e26ac5')
        .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.notEqual(err, null)
        done()
      })

      deleteGroup.handler({
        accessToken: ACCESSTOKEN,
        id:          'simrs-85e26ac5'
      }, null);
    });

    it("mrScaler Delete Fails should return fail cant get cluster", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .delete('/aws/emr/mrScaler/simrs-85e26ac5')
        .reply(400, {
          "request":  {
            "id":        "9bad8ebc-a42c-425f-83ab-fbec3b1cbd8a",
            "url":       "/aws/emr/mrScaler/simrs-85e26ac5",
            "method":    "GET",
            "timestamp": "2016-01-28T17:34:37.072Z"
          },
          "response": {
            "status": {
              "code":    400,
              "message": "Bad Request"
            }
          }
        });

      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .get('/aws/emr/mrScaler/simrs-85e26ac5')
        .reply(500, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.notEqual(err, null)
        done()
      })

      deleteGroup.handler({
        accessToken: ACCESSTOKEN,
        id:          'simrs-85e26ac5'
      }, null);
    });
  })
});

