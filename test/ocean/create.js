var _ = require('lodash'),
    assert = require('assert'),
    create = require('../../lib/resources/ocean/create'),
    ocean  = require('../../lib/resources/ocean'),
    sinon  = require('sinon'),
    lambda = require('../../'),
    nock   = require('nock'),
    sinon  = require('sinon'),
    util   = require('lambda-formation').util;

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
        "region": "us-west-2",
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

describe("ocean create resource", function () {
    beforeEach(()=>{
        nock.cleanAll();
        sandbox = sinon.createSandbox();
    })

    afterEach(()=>{
        sandbox.restore()
    });

    describe("create ocean cluster success", function () {
        describe("create ocean cluster variation tests", function(){

            it("create ocean handler should create a new cluster", function (done) {
                nock('https://api.spotinst.io', {"encodedQueryParams": true})
                    .post('/ocean/aws/k8s/cluster', {"cluster": config.ocean})
                    .reply(200, response);

                util.done = sandbox.spy((err, event, context, body)=>{
                    assert.equal(err, null)
                    done()
                })

                create.handler(
                    _.merge({accessToken: 'ACCESSTOKEN'}, config),
                    null
                );
            });

            it("ocean handler should create a new cluster", function(done){
                nock('https://api.spotinst.io', {"encodedQueryParams": true})
                .post('/ocean/aws/k8s/cluster', {"cluster": config.ocean})
                .reply(200, response);

                util.done = sandbox.spy((err, event, context, body)=>{
                    assert.equal(err, null)
                    done()
                })

                ocean.handler(
                    _.merge({
                    resourceType: 'ocean',
                    requestType: 'create',
                    accessToken: 'ACCESSTOKEN'
                    }, config),
                    null
                );
            });

            it("lambda ocean handler should create a new cluster", function(done){
                nock('https://api.spotinst.io', {"encodedQueryParams": true})
                    .post('/ocean/aws/k8s/cluster', {"cluster": config.ocean})
                    .reply(200, response);

                util.done = sandbox.spy((err, event, context, body)=>{
                    assert.equal(err, null)
                    done()
                })

                lambda.handler(
                    _.merge({
                        resourceType: 'ocean',
                        requestType: 'create',
                        accessToken: 'ACCESSTOKEN'
                    }, config),
                    context
                );
            });
        })

        it("creates ocean cluster with autoTags, input tags not found", function(done){
            nock('https://api.spotinst.io', {"encodedQueryParams": true})
                .post('/ocean/aws/k8s/cluster', {"cluster": config.ocean})
                .reply(200, response);

            util.done = sandbox.spy((err, event, context, body)=>{
                assert.equal(err, null)
                done()
            })

          create.handler(
            _.merge({
              accessToken: 'ACCESSTOKEN', 
              autoTag:true,
              LogicalResourceId:"ocean",
              StackId:"arn::12345/test/67890"
            }, config),
            context
          );
        })

        it("creates ocean cluster with autoTags, input tags found", function(done){
            nock('https://api.spotinst.io', {"encodedQueryParams": true})
                .post('/ocean/aws/k8s/cluster', {"cluster": config.ocean})
                .reply(200, response);

            util.done = sandbox.spy((err, event, context, body)=>{
                assert.equal(err, null)
                done()
            })

            let tempConfig = config

            tempConfig.ocean.compute.launchSpecification.tags = [{tagKey:"test", tagValue:"test"}] 

            create.handler(
                _.merge({
                  accessToken: 'ACCESSTOKEN', 
                  autoTag:true,
                  LogicalResourceId:"Elastigroup",
                  StackId:"arn::12345/test/67890"
                }, tempConfig),
                context
            );
        })
    });

    describe("fail to create ocean cluster", function(){
        it("return error from spotUtil.getTokenAndConfigs", function(done){
          util.done = sandbox.spy((err, event, context, body)=>{
            assert.notEqual(err, null)
            done()
          })

          create.handler(
            _.merge({id:'o-11111111',}, config),
            context
          );
        })

        it("create handler should throw error", function(done) {
            nock('https://api.spotinst.io', {"encodedQueryParams": true})
                .post('/ocean/aws/k8s/cluster', {"cluster": config.ocean})
                .reply(400, {});


          util.done = sandbox.spy((err, event, context, body)=>{
            assert.notEqual(err, null)
            done()
          })

          create.handler(
            _.merge({
              accessToken: 'ACCESSTOKEN',
            }, config),
            context
            );
        });
    })
});
