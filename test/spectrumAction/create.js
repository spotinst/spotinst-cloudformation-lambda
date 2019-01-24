var _ = require('lodash'),
  assert = require('assert'),
  create = require('../../lib/resources/spectrumAction/create'),
  spectrumAction = require('../../lib/resources/spectrumAction'),
  lambda = require('../../'),
  nock = require('nock'),
  sinon  = require('sinon'),
  util   = require('lambda-formation').util

var spectrumActionConfig = {
  "action": {
    "enabled": true,
    "name": "TestEmailAction",
    "type": "EMAIL",
    "params": {
      "email": "testEmailAction@spotinst.com"
    }
  }
};

describe("spectrumAction", function() {
  beforeEach(()=>{
    nock.cleanAll();
    sandbox = sinon.createSandbox();
  })

  afterEach(()=>{
    sandbox.restore()
  });

  describe("create resource", function() {
    it("create handler should create a new spectrumAction", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
        .post('/spectrum/metrics/action', spectrumActionConfig)
        .reply(200, {
          "request": {},
          "response": {
              "status": {
                  "code": 200,
                  "message": "OK"
              },
              "items": [
                  {
                      "id": "ac-ef459eb22456",
                      "enabled": true,
                      "name": "TestEmailAction",
                      "type": "EMAIL",
                      "params": {
                          "email": "testEmailAction@spotinst.com"
                      },
                      "updatedAt": "2018-06-29T18:47:01.072Z",
                      "createdAt": "2018-06-29T18:47:01.072Z"
                  }
              ],
              "count": 1
            }
        });
      
      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      create.handler(
        _.merge({accessToken: ACCESSTOKEN}, spectrumActionConfig),
        context
      );
    });

    it("spectrumAction handler should create a new spectrumAction", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
        .post('/spectrum/metrics/action', spectrumActionConfig)
        .reply(200, {
          "request": {},
          "response": {
              "status": {
                  "code": 200,
                  "message": "OK"
              },
              "items": [
                  {
                      "id": "ac-ef459eb22456",
                      "enabled": true,
                      "name": "TestEmailAction",
                      "type": "EMAIL",
                      "params": {
                          "email": "testEmailAction@spotinst.com"
                      },
                      "updatedAt": "2018-06-29T18:47:01.072Z",
                      "createdAt": "2018-06-29T18:47:01.072Z"
                  }
              ],
              "count": 1
            }
        });
      
      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
       done()
      })

      spectrumAction.handler(
        _.merge({
          requestType: 'Create',
          accessToken: ACCESSTOKEN
        },spectrumActionConfig),
        context
      );
    });

    it("lambda handler should create a new spectrumAction", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
        .post('/spectrum/metrics/action', spectrumActionConfig)
        .reply(200, {
          "request": {},
          "response": {
              "status": {
                  "code": 200,
                  "message": "OK"
              },
              "items": [
                  {
                      "id": "ac-ef459eb22456",
                      "enabled": true,
                      "name": "TestEmailAction",
                      "type": "EMAIL",
                      "params": {
                          "email": "testEmailAction@spotinst.com"
                      },
                      "updatedAt": "2018-06-29T18:47:01.072Z",
                      "createdAt": "2018-06-29T18:47:01.072Z"
                  }
              ],
              "count": 1
            }
        });

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err,  null)
        done()
      })

      lambda.handler(
        _.merge({
          resourceType: 'spectrumAction',
          requestType: 'Create',
          accessToken: ACCESSTOKEN
        }, spectrumActionConfig),
        context
      );
    });

    it("lambda handler should create a new spectrumAction from CloudFormation", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
        .post('/spectrum/metrics/action', spectrumActionConfig)
        .reply(200, {
          "request": {},
          "response": {
              "status": {
                  "code": 200,
                  "message": "OK"
              },
              "items": [
                  {
                      "id": "ac-ef459eb22456",
                      "enabled": true,
                      "name": "TestEmailAction",
                      "type": "EMAIL",
                      "params": {
                          "email": "testEmailAction@spotinst.com"
                      },
                      "updatedAt": "2018-06-29T18:47:01.072Z",
                      "createdAt": "2018-06-29T18:47:01.072Z"
                  }
              ],
              "count": 1
            }
        });

      util.done = sandbox.spy((err, event, context, body)=>{ 
        assert.equal(err, null)
        done()
      })

      lambda.handler({
        ResourceType: 'Custom::spectrumAction',
        RequestType: 'Create',
        ResourceProperties: _.merge({accessToken: ACCESSTOKEN},spectrumActionConfig)
      },
      context);
    });
    
    it("return error from spotUtil.getTokenAndConfigs", function(done){
      util.done = sandbox.spy((err, event, context, body)=>{
        assert.notEqual(err, null)
        done()
      })

      create.handler(
        _.merge({id:'sig-11111111'}, spectrumActionConfig),
        context
      );
    })
  });
});
