var _ = require('lodash'),
  assert = require('assert'),
  create = require('../../lib/resources/spectrumAlert/create'),
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
  describe("create resource", function() {
    before(function() {
      for (var i=0; i<4; i++) {

        nock('https://api.spotinst.io', {"encodedQueryParams":true})
        .post(
          '/spectrum/metrics/alert',
          spectrumAlertConfig
        )
        .reply(
          200,
          {
              "request": {
                  "id": "660c1f27-5584-4819-a99d-05ed9cbce7c5",
                  "url": "/spectrum/metrics/alert",
                  "method": "POST",
                  "timestamp": "2018-06-29T20:53:58.777Z"
              },
              "response": {
                  "status": {
                      "code": 200,
                      "message": "OK"
                  },
                  "kind": "spotinst:spectrum:alert",
                  "items": [
                      {
                          "id": "al-76b3d4d8dabc",
                          "enabled": true,
                          "status": "UNKNOWN",
                          "name": "Spotinst Test | spot_instances",
                          "namespace": "elastigroup",
                          "metricName": "spot_instances",
                          "period": "1h",
                          "consecutivePeriods": 2,
                          "statistic": "count",
                          "conditions": {
                              "error": {
                                  "threshold": 1,
                                  "operator": "le"
                              },
                              "warning": {
                                  "threshold": 2,
                                  "operator": "lt"
                              },
                              "critical": {
                                  "threshold": 0,
                                  "operator": "le"
                              }
                          },
                          "dimensions": [
                              {
                                  "name": "group_id",
                                  "value": "sig-9fc8ceb7"
                              }
                          ],
                          "description": "Test for spot instances",
                          "documentation": "test for number of spot instances",
                          "actionsEnabled": true,
                          "actions": {
                              "okActionIds": [],
                              "warningActionIds": [],
                              "errorActionIds": [],
                              "criticalActionIds": [],
                              "unknownActionIds": []
                          },
                          "updatedAt": "2018-06-29T20:53:58.763Z",
                          "createdAt": "2018-06-29T20:53:58.763Z"
                      }
                  ],
                  "count": 1
              }
          },
          {
            'access-control-allow-headers': 'Origin,Accept,Content-Type,X-Requested-With,X-CSRF-Token',
            'access-control-allow-methods': 'GET,POST,DELETE,PUT',
            'access-control-allow-origin': '*',
            'content-type': 'application/json; charset=utf-8'
          }
        );

      }
    });

    it("create handler should create a new spectrumAlert", function(done) {
      var context = {
        done: done
      };

      create.handler(
        _.merge({accessToken: ACCESSTOKEN}, spectrumAlertConfig),
        context
      );
    });

    it("spectrumAlert handler should create a new spectrumAlert", function(done) {
      var context = {
        done: done
      };

      spectrumAlert.handler(
        _.merge({
          requestType: 'Create',
          accessToken: ACCESSTOKEN
        },spectrumAlertConfig),
        context
      );
    });

    it("lambda handler should create a new spectrumAlert", function(done) {
      var context = {
        done: done
      };

      lambda.handler(
        _.merge({
          resourceType: 'spectrumAlert',
          requestType: 'Create',
          accessToken: ACCESSTOKEN
        }, spectrumAlertConfig),
        context
      );
    });

    it("lambda handler should create a new spectrumAlert from CloudFormation", function(done) {
      var context = {
        done: done
      };

      lambda.handler({
        ResourceType: 'Custom::spectrumAlert',
        RequestType: 'Create',
        ResourceProperties: _.merge({accessToken: ACCESSTOKEN},spectrumAlertConfig)
      },
      context
                    );
    });

  });
});
