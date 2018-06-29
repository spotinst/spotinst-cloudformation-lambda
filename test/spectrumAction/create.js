var _ = require('lodash'),
  assert = require('assert'),
  create = require('../../lib/resources/spectrumAction/create'),
  spectrumAction = require('../../lib/resources/spectrumAction'),
  lambda = require('../../'),
  nock = require('nock');

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
  describe("create resource", function() {
    before(function() {
      for (var i=0; i<4; i++) {

        nock('https://api.spotinst.io', {"encodedQueryParams":true})
        .post(
          '/spectrum/metrics/action',
          spectrumActionConfig
        )
        .reply(
          200,
          {
            "request": {
                "id": "e232b37c-0d2e-4c4b-b282-51e76bc977e9",
                "url": "/spectrum/metrics/action?accountId=act-000XXXXX",
                "method": "POST",
                "timestamp": "2018-06-29T18:47:01.448Z"
            },
            "response": {
                "status": {
                    "code": 200,
                    "message": "OK"
                },
                "kind": "spotinst:spectrum:action",
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
          },
          {
            'access-control-allow-headers': 'Origin,Accept,Content-Type,X-Requested-With,X-CSRF-Token',
            'access-control-allow-methods': 'GET,POST,DELETE,PUT',
            'access-control-allow-origin': '*',
            'content-type': 'application/json; charset=utf-8',
            connection: 'Close'
          }
        );

      }
    });

    it("create handler should create a new spectrumAction", function(done) {
      var context = {
        done: done
      };

      create.handler(
        _.merge({accessToken: ACCESSTOKEN}, spectrumActionConfig),
        context
      );
    });

    it("spectrumAction handler should create a new spectrumAction", function(done) {
      var context = {
        done: done
      };

      spectrumAction.handler(
        _.merge({
          requestType: 'Create',
          accessToken: ACCESSTOKEN
        },spectrumActionConfig),
        context
      );
    });

    it("lambda handler should create a new spectrumAction", function(done) {
      var context = {
        done: done
      };

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
      var context = {
        done: done
      };

      lambda.handler({
        ResourceType: 'Custom::spectrumAction',
        RequestType: 'Create',
        ResourceProperties: _.merge({accessToken: ACCESSTOKEN},spectrumActionConfig)
      },
      context
                    );
    });

  });
});
