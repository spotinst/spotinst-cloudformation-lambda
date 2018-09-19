var _ = require('lodash'),
  assert = require('assert'),
  update = require('../../lib/resources/spectrumAction/update'),
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
  describe("update", function() {

    before(function() {
      for (var i=0; i<3; i++) {
        nock('https://api.spotinst.io', {"encodedQueryParams":true})
        .put(
          '/spectrum/metrics/action/ac-eff4e5260196',
          spectrumActionConfig
        )
        .reply(
          200,
          {
              "request": {
                  "id": "037a9796-9a7f-4c60-a967-47d634a1744f",
                  "url": "/spectrum/metrics/action/ac-eff4e5260196",
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
          id: 'ac-eff4e5260196',
          accessToken: ACCESSTOKEN
        },spectrumActionConfig),
        context
      );
    });

    it("spectrumAction handler should update an existing group", function(done) {
      var context = {
        done: done
      };

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
      var context = {
        done: done
      };

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
        }, spectrumActionConfig),
        context
      );
    })
    
  });
});
