var _            = require('lodash'),
    assert       = require('assert'),
    update       = require('../../lib/resources/ocean/update'),
    ocean        = require('../../lib/resources/ocean'),
    lambda       = require('../../'),
    nock         = require('nock'),
    sinon        = require('sinon'),
    util         = require('lambda-formation').util;

var config = {
  "ocean":{
    "compute": {
      "instanceTypes": {
        "whitelist": [
          "c4.2xlarge"
        ]
      },
      "launchSpecification": {
        "imageId": "ami-1178f169",
        "securityGroupIds": [
          "sg-8cfb40f6"
        ],
        "keyPair": "Noam-key",
        "tags": [
          {
            "tagValue": "jeffrey",
            "tagKey": "creator"
          }
        ]
      },
      "subnetIds": [
        "subnet-1ba25052"
      ]
    },
    "name": "Test-Ocean",
    "controllerClusterId": "ocean.k8s",
    "strategy": {
      "spotPercentage": "100",
      "fallbackToOd": "true",
      "utilizeReservedInstances": "false"
    },
    "autoScaler": {
      "isEnabled": "true",
      "headroom": {
        "cpuPerUnit": "2000",
        "numOfUnits": "4",
        "memoryPerUnit": "0"
      },
      "cooldown": "180",
      "resourceLimits": {
        "maxVCpu": "750",
        "maxMemoryGib": "1500"
      },
      "down": {
        "evaluationPeriods": "3"
      },
      "isAutoConfig": "false"
    },
    "capacity": {
      "maximum": "1",
      "minimum": "0",
      "target": "1"
    }
  } 
}

var response = {
    "request": {
        "id": "a06c53a1-d53e-4844-a1c2-58b332b509e9",
        "url": "/ocean/aws/k8s/cluster?accountId=act-56c15b97",
        "method": "POST",
        "timestamp": "2018-12-20T23:37:10.289Z"
    },
    "response": {
        "status": {
            "code": 200,
            "message": "OK"
        },
        "kind": "spotinst:ocean:aws:k8s",
        "items": [
            {
                "id": "o-7c1c9a42",
                "name": "Test-Ocean",
                "controllerClusterId": "ocean.k8s",
                "region": "us-west-2",
                "autoScaler": {
                    "isEnabled": true,
                    "cooldown": 180,
                    "down": {
                        "evaluationPeriods": 3
                    },
                    "headroom": {
                        "cpuPerUnit": 2000,
                        "memoryPerUnit": 0,
                        "numOfUnits": 4
                    },
                    "isAutoConfig": false,
                    "resourceLimits": {
                        "maxVCpu": 750,
                        "maxMemoryGib": 1500
                    }
                },
                "capacity": {
                    "minimum": 0,
                    "maximum": 1,
                    "target": 1
                },
                "strategy": {
                    "utilizeReservedInstances": false,
                    "fallbackToOd": true,
                    "spotPercentage": 100
                },
                "compute": {
                    "subnetIds": [
                        "subnet-1ba25052"
                    ],
                    "instanceTypes": {
                        "whitelist": [
                            "c4.2xlarge"
                        ]
                    },
                    "launchSpecification": {
                        "securityGroupIds": [
                            "sg-8cfb40f6"
                        ],
                        "keyPair": "Noam-key",
                        "imageId": "ami-1178f169",
                        "tags": [
                            {
                                "tagKey": "creator",
                                "tagValue": "jeffrey"
                            }
                        ],
                        "userData": "__hidden__"
                    }
                },
                "createdAt": "2018-12-20T23:37:10.205Z",
                "updatedAt": "2018-12-20T23:37:10.205Z"
            }
        ],
        "count": 1
    }
}


describe("ocean", function() {
  describe("update cluster", function() {
    before(function () {
        for (var i = 0; i < 3; i++) {
            nock('https://api.spotinst.io', {"encodedQueryParams": true})
                .put('/ocean/aws/k8s/cluster/o-7c1c9a42', {"cluster": config.ocean})
                .reply(200, response);
        }
    });

    it("update handler should update a new cluster", function (done) {
        var context = {
            done: done
        };

        update.handler(
            _.merge({
              accessToken: ACCESSTOKEN,
              id: "o-7c1c9a42"
            }, config),
            context
        );
    });

    it("ocean handler should update a new cluster", function(done){
        var context = {
            done: done
        }

        ocean.handler(
            _.merge({
                resourceType: 'ocean',
                requestType: 'update',
                id: "o-7c1c9a42",
                accessToken: ACCESSTOKEN
            }, config),
            context
        );
    });

    it("lambda handler should update a new cluster", function(done){
        var context = {
            done: done
        }

        lambda.handler(
            _.merge({
                resourceType: 'ocean',
                requestType: 'update',
                id: "o-7c1c9a42",
                accessToken: ACCESSTOKEN
            }, config),
            context
        );
    });

    it("return error from spotUtil.getTokenAndConfig", function(done){
      var context = {
        done: ()=>{
          done()
      }}

      update.handler(
        _.merge({
          id: 'o-11111111',
        }, config),
        context
      );
    })

    it("update cluster with autoTags, input tags not found", function(done){
      var context = {
        done: done()
      };

      update.handler(
        _.merge({
          accessToken: ACCESSTOKEN, 
          autoTag:true,
          LogicalResourceId:"ocean",
          StackId:"arn::12345/test/67890"
        }, config),
        context
      );
    })

    it("update cluster with autoTags, input tags found", function(done){
      var context = {
        done: done()
      };

      let tempConfig = config

      tempConfig.ocean.compute.launchSpecification.tags = [{tagKey:"test", tagValue:"test"}] 

      update.handler(
        _.merge({
          accessToken: ACCESSTOKEN, 
          autoTag:true,
          LogicalResourceId:"ocean",
          StackId:"arn::12345/test/67890"
        }, tempConfig),
        context
      );
    })

  })

  describe("fail to update cluster", function(){

    it("update handler should throw error", function(done) {
      var context = {
        done: done
      };

      sinon.stub(util, "done").returns(done())

      update.handler(
        _.merge({
          accessToken: ACCESSTOKEN,
          id:          "o-7c1c9a42",
        }, config),
        context
        );

      util.done.restore()

    });

    it("ocean update handler should throw error", function(done) {
      var context = {
        done: done
      };

      sinon.stub(util, "done").returns(done())

      ocean.handler(
        _.merge({
          requestType: 'update',
          accessToken: ACCESSTOKEN,
          id:          "o-7c1c9a42",
        }, config)
      );

      util.done.restore()

    });
  })
});

