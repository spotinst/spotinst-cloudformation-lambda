var _ = require('lodash'),
  assert = require('assert'),
  create = require('../../lib/resources/spectrumAlert/create'),
  spectrumAlert = require('../../lib/resources/spectrumAlert'),
  lambda = require('../../'),
  nock = require('nock'),
  sinon  = require('sinon'),
  util   = require('lambda-formation').util

var spectrumAlertConfig = {
  "alert": {
    "enabled": true,
    "name": "Spotinst Test | spot_instances",
    "description": "Test for spot instances",
    "documentation": "test for number of spot instances",
    "namespace": "elastigroup",
    "metricName": "spot_instances",
    "dimensions": [
      {
        "name": "group_id",
       "value": "sig-9fc8ceb7"
      }
    ],
    "period": "1h",
    "consecutivePeriods": 2,
    "statistic": "count",
    "conditions": {
      "warning": {
        "threshold": 2,
        "operator": "lt"
      },
      "error": {
        "threshold": 1,
        "operator": "le"
      },
      "critical": {
        "threshold": 0,
        "operator": "le"
      }
    },
    "actionsEnabled": true,
    "actions": {
      "unknownActionIds": [],
      "okActionIds": [
      ],
      "warningActionIds": [
      ],
      "errorActionIds": [
      ],
      "criticalActionIds": [
      ]
    }
  }
};

describe("spectrumAlert", function() {
  beforeEach(()=>{
    nock.cleanAll();
    sandbox = sinon.createSandbox();
  })

  afterEach(()=>{
    sandbox.restore()
  });


  describe("create resource", function() {
    it("create handler should create a new spectrumAlert", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .post('/spectrum/metrics/alert',spectrumAlertConfig)
      .reply(200, {"response": {"status": {},"items": [{"id": "al-76b3d4d8dabc"}]}});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      create.handler(
        _.merge({accessToken: ACCESSTOKEN}, spectrumAlertConfig),
        context
      );
    });

    it("spectrumAlert handler should create a new spectrumAlert", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .post('/spectrum/metrics/alert',spectrumAlertConfig)
      .reply(200, {"response": {"status": {},"items": [{"id": "al-76b3d4d8dabc"}]}});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      spectrumAlert.handler(
        _.merge({
          requestType: 'Create',
          accessToken: ACCESSTOKEN
        },spectrumAlertConfig),
        context
      );
    });

    it("lambda handler should create a new spectrumAlert", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .post('/spectrum/metrics/alert',spectrumAlertConfig)
      .reply(200, {"response": {"status": {},"items": [{"id": "al-76b3d4d8dabc"}]}});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      lambda.handler(
        _.merge({
          resourceType: 'spectrumAlert',
          requestType: 'Create',
          accessToken: ACCESSTOKEN
        }, spectrumAlertConfig),
        context);
    });

    it("lambda handler should create a new spectrumAlert from CloudFormation", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .post('/spectrum/metrics/alert',spectrumAlertConfig)
      .reply(200, {"response": {"status": {},"items": [{"id": "al-76b3d4d8dabc"}]}});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })
      
      lambda.handler({
        ResourceType: 'Custom::spectrumAlert',
        RequestType: 'Create',
        ResourceProperties: _.merge({accessToken: ACCESSTOKEN},spectrumAlertConfig)
      },context);
    });

    it("return error from spotUtil.getTokenAndConfigs", function(done){
      util.done = sandbox.spy((err, event, context, body)=>{
        assert.notEqual(err, null)
        done()
      })

      create.handler(
        _.merge({
          id:           'sig-11111111',
        }, spectrumAlertConfig),
        context);
    })
  });
});
