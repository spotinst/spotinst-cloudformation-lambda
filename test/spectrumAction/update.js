var _ = require('lodash'),
  assert = require('assert'),
  update = require('../../lib/resources/spectrumAction/update'),
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

  describe("update", function() {
    it("update handler should update an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .put('/spectrum/metrics/action/ac-eff4e5260196', spectrumActionConfig)
      .reply(200,{});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      update.handler(
        _.merge({
          id: 'ac-eff4e5260196',
          accessToken: ACCESSTOKEN
        },spectrumActionConfig),
        context
      );
    });

    it("spectrumAction handler should update an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .put('/spectrum/metrics/action/ac-eff4e5260196', spectrumActionConfig)
      .reply(200,{});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      update.handler(
        _.merge({
          id: 'ac-eff4e5260196',
          requestType: 'update',
          accessToken: ACCESSTOKEN
        },spectrumActionConfig),
        context
      );
    });

    it("lambda handler should update an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .put('/spectrum/metrics/action/ac-eff4e5260196', spectrumActionConfig)
      .reply(200,{});


      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      update.handler(
        _.merge({
          id: 'ac-eff4e5260196',
          resourceType: 'spectrumAction',
          requestType: 'update',
          accessToken: ACCESSTOKEN
        },spectrumActionConfig),
        context
      );
    });

    it("return error from spotUtil.getTokenAndConfig", function(done){

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.notEqual(err, null)
        done()
      })

      update.handler(
        _.merge({id: 'sig-11111111'}, spectrumActionConfig),
        context
      );
    })
    
  });
});
