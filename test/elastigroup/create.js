var _ = require('lodash'),
    assert = require('assert'),
    create = require('../../lib/resources/elastigroup/create'),
    elastigroup = require('../../lib/resources/elastigroup'),
    lambda = require('../../'),
    nock         = require('nock'),
    sinon     = require('sinon'),
    util      = require('lambda-formation').util;

var groupConfig = {
    "group": {
        "name": "test",
        "strategy": {
            "risk": 100,
            "onDemandCount": null,
            "availabilityVsCost": "balanced"
        },
        "capacity": {
            "target": 1,
            "minimum": 1,
            "maximum": 1
        },
        "scaling": {},
        "compute": {
            "instanceTypes": {
                "ondemand": "m3.medium",
                "spot": [
                    "m3.medium"
                ]
            },
            "availabilityZones": [
                {
                    "name": "us-east-1a",
                    "subnetId": "subnet-11111111"
                }
            ],
            "launchSpecification": {
                "securityGroupIds": [
                    "sg-11111111"
                ],
                "monitoring": false,
                "imageId": "ami-60b6c60a",
                "keyPair": "testkey"
            },
            "product": "Linux/UNIX"
        },
        "scheduling": {},
        "thirdPartiesIntegration": {}
    }
}

describe("elastigroup", function () {
    beforeEach(()=>{
        nock.cleanAll();
        sandbox = sinon.createSandbox();
    })

    afterEach(()=>{
        sandbox.restore()
    });

    describe("create resource", function () {
        it("create handler should create a new group", function(done) {

          nock('https://api.spotinst.io', {"encodedQueryParams":true})
          .post('/aws/ec2/group', {"group":{"name":"test","strategy":{"risk":100,"onDemandCount":null,"availabilityVsCost":"balanced"},"capacity":{"target":1,"minimum":1,"maximum":1},"scaling":{},"compute":{"instanceTypes":{"ondemand":"m3.medium","spot":["m3.medium"]},"availabilityZones":[{"name":"us-east-1a","subnetId":"subnet-11111111"}],"launchSpecification":{"securityGroupIds":["sg-11111111"],"monitoring":false,"imageId":"ami-60b6c60a","keyPair":"testkey"},"product":"Linux/UNIX"},"scheduling":{},"thirdPartiesIntegration":{}}})
          .reply(200, {"response":{"items":[{"id":"sig-a307d690"}]}});

          util.done = sandbox.spy((err, event, context, body)=>{
            assert.equal(err, null)
            done()
          })

          create.handler(
            _.merge({accessToken: ACCESSTOKEN}, groupConfig),
            context
          );
        });

        it("elastigroup handler should create a new group", function(done) {
          nock('https://api.spotinst.io', {"encodedQueryParams":true})
          .post('/aws/ec2/group', {"group":{"name":"test","strategy":{"risk":100,"onDemandCount":null,"availabilityVsCost":"balanced"},"capacity":{"target":1,"minimum":1,"maximum":1},"scaling":{},"compute":{"instanceTypes":{"ondemand":"m3.medium","spot":["m3.medium"]},"availabilityZones":[{"name":"us-east-1a","subnetId":"subnet-11111111"}],"launchSpecification":{"securityGroupIds":["sg-11111111"],"monitoring":false,"imageId":"ami-60b6c60a","keyPair":"testkey"},"product":"Linux/UNIX"},"scheduling":{},"thirdPartiesIntegration":{}}})
          .reply(200, {"response":{"items":[{"id":"sig-a307d690"}]}});

          util.done = sandbox.spy((err, event, context, body)=>{
            assert.equal(err, null)
            done()
          })

          elastigroup.handler(
            _.merge({
              requestType: 'Create',
              accessToken: ACCESSTOKEN
            },groupConfig),
            context
          );
        });

        it("lambda handler should create a new group", function(done) {
          nock('https://api.spotinst.io', {"encodedQueryParams":true})
          .post('/aws/ec2/group', {"group":{"name":"test","strategy":{"risk":100,"onDemandCount":null,"availabilityVsCost":"balanced"},"capacity":{"target":1,"minimum":1,"maximum":1},"scaling":{},"compute":{"instanceTypes":{"ondemand":"m3.medium","spot":["m3.medium"]},"availabilityZones":[{"name":"us-east-1a","subnetId":"subnet-11111111"}],"launchSpecification":{"securityGroupIds":["sg-11111111"],"monitoring":false,"imageId":"ami-60b6c60a","keyPair":"testkey"},"product":"Linux/UNIX"},"scheduling":{},"thirdPartiesIntegration":{}}})
          .reply(200, {"response":{"items":[{"id":"sig-a307d690"}]}});

          util.done = sandbox.spy((err, event, context, body)=>{
            assert.equal(err, null)
            done()
          })

          lambda.handler(
            _.merge({
              resourceType: 'elasticgroup',
              requestType: 'Create',
              accessToken: ACCESSTOKEN
            }, groupConfig),
            context
          );
        });

        it("lambda handler should create a new group from CloudFormation", function(done) {
          nock('https://api.spotinst.io', {"encodedQueryParams":true})
          .post('/aws/ec2/group', {"group":{"name":"test","strategy":{"risk":100,"onDemandCount":null,"availabilityVsCost":"balanced"},"capacity":{"target":1,"minimum":1,"maximum":1},"scaling":{},"compute":{"instanceTypes":{"ondemand":"m3.medium","spot":["m3.medium"]},"availabilityZones":[{"name":"us-east-1a","subnetId":"subnet-11111111"}],"launchSpecification":{"securityGroupIds":["sg-11111111"],"monitoring":false,"imageId":"ami-60b6c60a","keyPair":"testkey"},"product":"Linux/UNIX"},"scheduling":{},"thirdPartiesIntegration":{}}})
          .reply(200, {"response":{"items":[{"id":"sig-a307d690"}]}});

          util.done = sandbox.spy((err, event, context, body)=>{
            assert.equal(err, null)
            done()
          })

          lambda.handler({
            ResourceType: 'Custom::elasticgroup',
            RequestType: 'Create',
            ResourceProperties: _.merge({accessToken: ACCESSTOKEN},groupConfig)
          },
          context
                        );
        });
    });
});
