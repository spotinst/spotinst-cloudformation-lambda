var _ = require('lodash'),
  assert = require('assert'),
  update = require('../../lib/resources/spectrumAlert/update'),
  spectrumAlert = require('../../lib/resources/spectrumAlert'),
  lambda = require('../../'),
  nock = require('nock');

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
  describe("update", function() {

    before(function() {
      for (var i=0; i<3; i++) {
        nock('https://api.spotinst.io', {"encodedQueryParams":true})
        .put(
          '/spectrum/metrics/alert/al-76b3d4d8dabc',
          spectrumAlertConfig
        )
        .reply(
          200,
          {
              "request": {
                  "id": "037a9796-9a7f-4c60-a967-47d634a1744f",
                  "url": "/spectrum/metrics/alert/al-76b3d4d8dabc",
                  "method": "PUT",
                  "timestamp": "2018-06-29T20:21:14.641Z"
              },
              "response": {
                  "status": {
                      "code": 200,
                      "message": "OK"
                  }
              }
          },
          {
            'access-control-allow-headers': 'Origin,Accept,Content-Type,X-Requested-With,X-CSRF-Token',
            'access-control-allow-methods': 'GET,POST,DELETE,PUT',
            'access-control-allow-origin': '*',
            'content-type': 'application/json; charset=utf-8'
          });

      }
    });

    it("update handler should update an existing group", function(done) {
      var context = {
        done: done
      };

      update.handler(
        _.merge({
          id: 'al-76b3d4d8dabc',
          accessToken: ACCESSTOKEN
        },spectrumAlertConfig),
        context
      );
    });

    it("spectrumAlert handler should update an existing group", function(done) {
      var context = {
        done: done
      };

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
      var context = {
        done: done
      };

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
      var context = {
        done: ()=>{
          done()
      }}

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
