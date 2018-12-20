var assert       = require('assert'),
    deleteOcean  = require('../../lib/resources/ocean/delete'),
    ocean        = require('../../lib/resources/ocean'),
    lambda       = require('../../'),
    nock         = require('nock');

describe("ocean", function() {
  describe("delete resource", function() {
    before(function() {
      for(var i = 0; i < 5; i++) {
        nock('https://api.spotinst.io', {"encodedQueryParams": true})
          .delete('/ocean/aws/k8s/cluster/o-7c1c9a42')
          .reply(200, "success");
      }
    });

    it("delete handler should delete an existing group", function(done) {
      var context = {
        done: done
      };

      deleteOcean.handler({
        accessToken: ACCESSTOKEN,
        id:          'o-7c1c9a42'
      }, context);
    });

    it("ocean handler should delete an existing group", function(done) {
      var context = {
        done: done
      };

      ocean.handler({
        requestType: 'delete',
        accessToken: ACCESSTOKEN,
        id:          'o-7c1c9a42'
      }, context);
    });

    it("lambda handler should delete an existing group", function(done) {
      var context = {
        done: done
      };

      lambda.handler({
        resourceType: 'ocean',
        requestType:  'delete',
        accessToken:  ACCESSTOKEN,
        id:           'o-7c1c9a42'
      }, context);
    });

    it("should delete with autoTags", function(done){
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .get('/ocean/aws/k8s/cluster')
        .reply(200, {
          "response": {
            "status": {
              "code":    200,
              "message": "OK"
            },
            "items":[
              {
                "id":"sig-11111111",
                "compute":{
                  "launchSpecification":{
                    "tags":[
                      {"tagKey":"spotinst:aws:cloudformation:logical-id", "tagValue": "Elastigroup"},
                      {"tagKey":"spotinst:aws:cloudformation:stack-id"  , "tagValue": "arn::12345/test/67890"},
                      {"tagKey":"spotinst:aws:cloudformation:stack-name", "tagValue": "test"}
                    ]
                  }
                }
              }
            ]
          }
        });
      
      var context = {
        done: done()
      };

      deleteOcean.handler({
        accessToken: ACCESSTOKEN,
        id:          'OceanError',
        autoTag:true,
        LogicalResourceId:"ocean",
        StackId:"arn::12345/test/67890"
      }, context);      
    })   

  });

  describe("delete resource fail", function() {
    it("should fail to get token", function(done){
      context = {
        done:done()
      }

      deleteOcean.handler({
        id: 'o-11111111',
      }, context);   
    })

    it("should rollback", function(done){
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .get('/ocean/aws/k8s/cluster')
        .reply(200, {
          "response": {
            "status": {
              "code":    200,
              "message": "OK"
            },
            "items":[
              {
                "id":"sig-11111111",
                "compute":{
                  "launchSpecification":{
                    "tags":[
                      {"tagKey":"spotinst:aws:cloudformation:logical-id", "tagValue": "Elastigroup"},
                      {"tagKey":"spotinst:aws:cloudformation:stack-id"  , "tagValue": "arn::12345/test/67890"},
                      {"tagKey":"spotinst:aws:cloudformation:stack-name", "tagValue": "test"}
                    ]
                  }
                }
              }
            ]
          }
        });
      
      var context = {
        done: done()
      };

      deleteOcean.handler({
        accessToken: ACCESSTOKEN,
        id:          'OceanError',
        autoTag:false,
        LogicalResourceId:"ocean",
        StackId:"arn::12345/test/67890"
      }, context);      
    })   

  });


});
