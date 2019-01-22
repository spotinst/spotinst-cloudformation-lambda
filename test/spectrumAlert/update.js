var _ = require('lodash'),
  assert = require('assert'),
  update = require('../../lib/resources/spectrumAlert/update'),
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

  describe("update", function() {

    it("update handler should update an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .put('/spectrum/metrics/alert/al-76b3d4d8dabc',spectrumAlertConfig)
      .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null);
        done();
      })

      update.handler(
        _.merge({
          id: 'al-76b3d4d8dabc',
          accessToken: ACCESSTOKEN
        },spectrumAlertConfig)
        ,context);
    });

    it("spectrumAlert handler should update an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .put('/spectrum/metrics/alert/al-76b3d4d8dabc',spectrumAlertConfig)
      .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null);
        done();
      })

      update.handler(
        _.merge({
          id: 'al-76b3d4d8dabc',
          requestType: 'update',
          accessToken: ACCESSTOKEN
        },spectrumAlertConfig),
        context
      );
    });

    it("lambda handler should update an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .put('/spectrum/metrics/alert/al-76b3d4d8dabc',spectrumAlertConfig)
      .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null);
        done();
      })

      update.handler(
        _.merge({
          id: 'al-76b3d4d8dabc',
          resourceType: 'spectrumAlert',
          requestType: 'update',
          accessToken: ACCESSTOKEN
        },spectrumAlertConfig),
        context
      );
    });

    it("return error from spotUtil.getTokenAndConfig", function(done){
      util.done = sandbox.spy((err, event, context, body)=>{
        assert.notEqual(err, null);
        done();
      })

      var updatePolicyConfig = {
        shouldRoll: false,
        rollConfig: {
          batchSizePercentage: 50,
          gracePeriod:         600
        }
      };

      update.handler(
        _.merge({
          id:           'sig-11111111',
          updatePolicy: updatePolicyConfig
        }, spectrumAlertConfig),
        context
      );
    })
  });
});
