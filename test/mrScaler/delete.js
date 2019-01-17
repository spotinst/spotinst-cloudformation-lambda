var assert       = require('assert'),
    deleteGroup  = require('../../lib/resources/mrScaler/delete'),
    mrScaler = require('../../lib/resources/mrScaler'),
    lambda       = require('../../'),
    nock         = require('nock');
    spotUtil     = require('../../lib/util')

describe("mrScaler", function() {
  describe("delete resource", function() {
    before(function() {
      for(var i = 0; i < 4; i++) {
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
      }
    });

    it("delete handler should delete an existing group", function(done) {
      var context = {
        done: function(err, obj) {
          assert.ifError(err);
          assert.equal(JSON.parse(obj).request.url, "/aws/emr/mrScaler/simrs-85e26ac5");
          done(err, obj);
        }
      };

      deleteGroup.handler({
        accessToken: ACCESSTOKEN,
        id:          'simrs-85e26ac5',
      }, context);
    });

    it("mrScaler handler should delete an existing group", function(done) {
      var context = {
        done: function(err, obj) {
          assert.ifError(err);
          assert.equal(JSON.parse(obj).request.url, "/aws/emr/mrScaler/simrs-85e26ac5");
          done(err, obj);
        }
      };

      mrScaler.handler({
        requestType: 'delete',
        accessToken: ACCESSTOKEN,
        id:          'simrs-85e26ac5'
      }, context);
    });

    it("lambda handler should delete an existing group", function(done) {
      var context = {
        done: function(err, obj) {
          assert.ifError(err);
          assert.equal(JSON.parse(obj).request.url, "/aws/emr/mrScaler/simrs-85e26ac5");
          done(err, obj);
        }
      };

      lambda.handler({
        resourceType: 'mrScaler',
        requestType:  'delete',
        accessToken:  ACCESSTOKEN,
        id:           'simrs-85e26ac5'
      }, context);
    });

    it("delete group with autoTag set to true", function(done){
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .get('/aws/emr/mrScaler')
        .reply(200, {
          "response": {
            "items":[
              {
                "id":"simrs-85e26ac5",
                "compute":{"tags":[{"tagKey":"spotinst:aws:cloudformation:logical-id", "tagValue": "MrScaler"},{"tagKey":"spotinst:aws:cloudformation:stack-id"  , "tagValue": "arn::12345/test/67890"},{"tagKey":"spotinst:aws:cloudformation:stack-name", "tagValue": "test"}]}
              }
            ]
          }
        });
      
      var context = {
        done: done()
      };

      deleteGroup.handler({
        accessToken: ACCESSTOKEN,
        id:          'MrScaler Errror',
        autoTag:true,
        LogicalResourceId:"MrScaler",
        StackId:"arn::12345/test/67890"
      }, context);      
    })

    it("fail to get cluster from tags 1 time then success", function(done){
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .get('/aws/emr/mrScaler')
        .reply(400, {});
      
      var context = {
        done: done()
      };

      deleteGroup.handler({
        accessToken: ACCESSTOKEN,
        id:          'MrScaler Error',
        autoTag:true,
        LogicalResourceId:"MrScaler-failed",
        StackId:"arn::12345/test/67890"
      }, context);  
    })
  });

  describe("delete resource fail", function() {
    beforeEach(function() {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .delete('/aws/emr/mrScaler/simrs-85e26ac5')
        .reply(400, {
          "request":  {
            "id":        "9bad8ebc-a42c-425f-83ab-fbec3b1cbd8a",
            "url":       "/aws/emr/mrScaler/simrs-85e26ac5",
            "method":    "DELETE",
            "timestamp": "2016-01-28T17:34:37.072Z"
          },
          "response": {
            "status": {
              "code":    400,
              "message": "Bad Request"
            }
          }
        });
    });

    describe("cluster exists", function() {
      it("should return error", function(done) {
        nock('https://api.spotinst.io', {"encodedQueryParams": true})
          .get('/aws/emr/mrScaler/simrs-85e26ac5')
          .reply(200, {
            "request":  {
              "id":        "9bad8ebc-a42c-425f-83ab-fbec3b1cbd8a",
              "url":       "/aws/emr/mrScaler/simrs-85e26ac5",
              "method":    "GET",
              "timestamp": "2016-01-28T17:34:37.072Z"
            },
            "response": {
              "status": {
                "code":    200,
                "message": "OK"
              }
            }
          });

        var context = {
          done: done()
        };

        deleteGroup.handler({
          accessToken: ACCESSTOKEN,
          id:          'simrs-85e26ac5'
        }, context);
      });
    });

    describe("cluster doesn't exists", function() {
      it("should return ok", function(done) {
        nock('https://api.spotinst.io', {"encodedQueryParams": true})
          .get('/aws/emr/mrScaler/simrs-85e26ac5')
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

        var context = {
          done: done()
        };

        deleteGroup.handler({
          accessToken: ACCESSTOKEN,
          id:          'simrs-85e26ac5'
        }, context);
      });

      it("should return error", function(done) {
        nock('https://api.spotinst.io', {"encodedQueryParams": true})
          .get('/aws/emr/mrScaler/simrs-85e26ac5')
          .reply(500, {
            "request":  {
              "id":        "9bad8ebc-a42c-425f-83ab-fbec3b1cbd8a",
              "url":       "/aws/emr/mrScaler/simrs-85e26ac5",
              "method":    "GET",
              "timestamp": "2016-01-28T17:34:37.072Z"
            },
            "response": {
              "status": {
                "code":    500,
                "message": "Bad Request"
              }
            }
          });

        var context = {
          done: done()
        };

        deleteGroup.handler({
          accessToken: ACCESSTOKEN,
          id:          'simrs-85e26ac5'
        }, context);

      });
    });
  });

  describe("delete test no setup", function(){
    it("should return error from get token mrScaler", function(done) {
      var context = {
        done: function(err, obj) {
          assert.notEqual(err, null);
          done(null, obj);
        }
      };

      deleteGroup.handler({
        id:          'simrs-85e26ac5'
      }, context);
    });


    it("should return cluster cannot be terminated", function(done){
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .delete('/aws/emr/mrScaler/simrs-85e26ac5')
        .reply(400, {
          "request":  {
            "id":        "9bad8ebc-a42c-425f-83ab-fbec3b1cbd8a",
            "url":       "/aws/emr/mrScaler/simrs-85e26ac5",
            "method":    "delete",
            "timestamp": "2016-01-28T17:34:37.072Z"
          },
          "response": {
            "errors":[
              {"message":"test. Please disable termination protection and try again."}
            ]
          }
        });

      var context = {
        done: done()
      };

      deleteGroup.handler({
        accessToken: ACCESSTOKEN,
        id:          'simrs-85e26ac5'
      }, context);
    })

    it("should rollback not delete mrScaler", function(done){
      var context = {
        done: done() 
      };

      deleteGroup.handler({
        accessToken: ACCESSTOKEN,
        StackId: "test",
        id:          'ResourceFailed'
      }, context);
    })
  })
});
