var assert = require('assert'),
  deleteGroup = require('../../lib/resources/spectrumAlert/delete'),
  spectrumAlert = require('../../lib/resources/spectrumAlert'),
  lambda = require('../../'),
  nock = require('nock');

describe("spectrumAlert", function() {
  describe("delete resource", function() {
    before(function() {
      for(var i=0;i<3;i++) {
        nock('https://api.spotinst.io', {"encodedQueryParams":true})
        .delete('/spectrum/metrics/alert/al-76b3d4d8dabc')
        .reply(200,
          {
              "request": {
                  "id": "c60c4796-fbde-4e03-bcef-1cc97e374376",
                  "url": "/spectrum/metrics/alert/al-76b3d4d8dabc",
                  "method": "DELETE",
                  "timestamp": "2018-06-29T20:08:34.036Z"
              },
              "response": {
                  "status": {
                      "code": 200,
                      "message": "OK"
                  }
              }
          },
          {
            'content-type': 'application/json; charset=utf-8',
             vary: 'Accept-Encoding',
             connection: 'Close'
          });
      }
    });

    it("delete handler should delete an existing group", function(done) {
      var context = {
        done: function(err,obj) {
          assert.ifError(err);
          assert.equal(obj.request.url, "/spectrum/metrics/alert/al-76b3d4d8dabc");
          done(err,obj);
        }
      };

      deleteGroup.handler({
        accessToken: ACCESSTOKEN,
        id: 'al-76b3d4d8dabc'
      },
      context
                         );
    });

    it("spectrumAlert handler should delete an existing group", function(done) {
      var context = {
        done: function(err,obj) {
          assert.ifError(err);
          assert.equal(obj.request.url, "/spectrum/metrics/alert/al-76b3d4d8dabc");
          done(err,obj);
        }
      };

      spectrumAlert.handler({
        requestType: 'delete',
        accessToken: ACCESSTOKEN,
        id: 'al-76b3d4d8dabc'
      },
      context
                         );
    });

    it("lambda handler should delete an existing group", function(done) {
      var context = {
        done: function(err,obj) {
          assert.ifError(err);
          assert.equal(obj.request.url, "/spectrum/metrics/alert/al-76b3d4d8dabc");
          done(err,obj);
        }
      };

      lambda.handler({
        resourceType: 'spectrumAlert',
        requestType: 'delete',
        accessToken: ACCESSTOKEN,
        id: 'al-76b3d4d8dabc'
      },
      context
                         );
    });

    it("lambda handler should delete for CloudFormation", function(done) {

      nock('https://api.spotinst.io', {"encodedQueryParams":true})
      .delete('/spectrum/metrics/alert/al-76b3d4d8dabc')
      .reply(200, {});

      nock('https://fake.url')
      .put('/', {"Status":"SUCCESS","Reason":"See the details in CloudWatch Log Stream: undefined","StackId":"arn:aws:cloudformation:us-east-1:namespace:stack/stack-name/guid","RequestId":"unique id for this create request","LogicalResourceId":"name of resource in template"})
      .reply(200, {});

      var context = {
        done: function(err,obj) {
          assert.ifError(err);
          done(err,obj);
        }
      };

      lambda.handler({
        ResourceType: 'Custom::spectrumAlert',
        ResourceProperties: {
          accessToken: ACCESSTOKEN,
        },
        RequestType: "Delete",
        RequestId: "unique id for this create request",
        ResponseURL: "https://fake.url",
        LogicalResourceId: "name of resource in template",
        PhysicalResourceId: 'al-76b3d4d8dabc',
        StackId: "arn:aws:cloudformation:us-east-1:namespace:stack/stack-name/guid"
      },
      context);
    });
  });
});
