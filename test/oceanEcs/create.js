var _      = require('lodash'),
    assert = require('assert'),
    create = require('../../lib/resources/oceanEcs/create'),
    ocean  = require('../../lib/resources/oceanEcs'),
    sinon  = require('sinon'),
    lambda = require('../../'),
    nock   = require('nock'),
    sinon  = require('sinon'),
    util   = require('lambda-formation').util;

var config = {
  "oceanEcs": {
    "region":      "us-west-2",
    "name":        "ocean-ecs-cfn",
    "clusterName": "ocean-ecs-OD-CFN",
    "autoScaler":  {
      "resourceLimits": {
        "maxMemoryGib": 100000,
        "maxVCpu":      20000
      }
    },
    "capacity":    {
      "target":  1,
      "minimum": 0,
      "maximum": 1000
    },
    "compute":     {
      "subnetIds":           [
        "subnet-0b5254eb0e52b2c5f"
      ],
      "instanceTypes":       {
        "whitelist": null
      },
      "launchSpecification": {
        "imageId":                  "ami-0e5e051fd0b505db6",
        "userData":                 "IyEvYmluL2Jhc2gKZWNobyBFQ1NfQ0xVU1RFUj1vY2Vhbi1lY3MtT0QtQ0ZOID4+IC9ldGMvZWNzL2Vjcy5jb25maWc7ZWNobyBFQ1NfQkFDS0VORF9IT1NUPSA+PiAvZXRjL2Vjcy9lY3MuY29uZmlnOw==",
        "securityGroupIds":         [
          "sg-0457601545e7f95f7"
        ],
        "iamInstanceProfile":       {
          "arn": "arn:aws:iam::842422002533:instance-profile/ecsInstanceRole"
        },
        "keyPair":                  null,
        "tags":                     [
          {
            "tagKey":   "Description",
            "tagValue": "This instance is the part of the Auto Scaling group which was created through ECS Console"
          },
          {
            "tagKey":   "Name",
            "tagValue": "ECS Instance - EC2ContainerService-ocean-ecs-OD-CFN"
          }
        ],
        "monitoring":               true,
        "associatePublicIpAddress": true
      }
    },
    "strategy":    {
      "drainingTimeout": 120,
      "fallbackToOd":    true
    }
  }
};


var response = {
  "request": {
    "id": "7e0ac37b-5f25-42d3-87bd-7da877d6fd41",
    "url": "/ocean/aws/ecs/cluster?accountId=act-00045b34&region=us-west-2",
    "method": "POST",
    "timestamp": "2019-08-01T07:49:53.845Z"
  },
  "response": {
    "status": {
      "code": 200,
      "message": "OK"
    },
    "kind": "spotinst:ocean:aws:ecs",
    "items": [
      {
        "id": "o-8a308c58",
        "name": "ocean-ecs-cfn",
        "clusterName": "ocean-ecs-OD-CFN",
        "autoScaler": {
          "resourceLimits": {
            "maxVCpu": 20000,
            "maxMemoryGib": 100000
          }
        },
        "region": "us-west-2",
        "capacity": {
          "minimum": 0,
          "maximum": 1000,
          "target": 1
        },
        "strategy": {
          "fallbackToOd": true,
          "drainingTimeout": 120
        },
        "compute": {
          "subnetIds": [
            "subnet-0b5254eb0e52b2c5f"
          ],
          "instanceTypes": {},
          "launchSpecification": {
            "securityGroupIds": [
              "sg-0457601545e7f95f7"
            ],
            "iamInstanceProfile": {
              "arn": "arn:aws:iam::842422002533:instance-profile/ecsInstanceRole"
            },
            "imageId": "ami-0e5e051fd0b505db6",
            "userData": "__hidden__",
            "tags": [
              {
                "tagKey": "Description",
                "tagValue": "This instance is the part of the Auto Scaling group which was created through ECS Console"
              },
              {
                "tagKey": "Name",
                "tagValue": "ECS Instance - EC2ContainerService-ocean-ecs-OD-CFN"
              }
            ],
            "associatePublicIpAddress": true,
            "monitoring": true
          }
        },
        "createdAt": "2019-08-01T07:49:53.824Z",
        "updatedAt": "2019-08-01T07:49:53.824Z"
      }
    ],
    "count": 1
  }
}

describe("ocean ecs create resource", function() {
  beforeEach(() => {
    nock.cleanAll();
    sandbox = sinon.createSandbox();
  })
  
  afterEach(() => {
    sandbox.restore()
  });
  
  describe("create ocean ecs cluster success", function() {
    describe("create ocean cluster ecs variation tests", function() {
      
      it("create ocean ecs handler should create a new cluster", function(done) {
        nock('https://api.spotinst.io', {"encodedQueryParams": true})
          .post('/ocean/aws/ecs/cluster', {"cluster": config.oceanEcs})
          .reply(200, response);
        
        util.done = sandbox.spy((err, event, context, body) => {
          assert.equal(err, null)
          done()
        })
        
        create.handler(
          _.merge({accessToken: 'ACCESSTOKEN'}, config),
          null
        );
      });
      
      it("ocean handler should create a new cluster", function(done) {
        nock('https://api.spotinst.io', {"encodedQueryParams": true})
          .post('/ocean/aws/ecs/cluster', {"cluster": config.oceanEcs})
          .reply(200, response);
        
        util.done = sandbox.spy((err, event, context, body) => {
          assert.equal(err, null)
          done()
        })
        
        ocean.handler(
          _.merge({
            resourceType: 'oceanEcs',
            requestType:  'create',
            accessToken:  'ACCESSTOKEN'
          }, config),
          null
        );
      });
      
      it("lambda ocean handler should create a new cluster", function(done) {
        nock('https://api.spotinst.io', {"encodedQueryParams": true})
          .post('/ocean/aws/ecs/cluster', {"cluster": config.oceanEcs})
          .reply(200, response);
        
        util.done = sandbox.spy((err, event, context, body) => {
          assert.equal(err, null)
          done()
        })
        
        lambda.handler(
          _.merge({
            resourceType: 'oceanEcs',
            requestType:  'create',
            accessToken:  'ACCESSTOKEN'
          }, config),
          context
        );
      });
    })
  });
  
  describe("fail to create ocean cluster", function() {
    it("return error from spotUtil.getTokenAndConfigs", function(done) {
      util.done = sandbox.spy((err, event, context, body) => {
        assert.notEqual(err, null)
        done()
      })
      
      create.handler(
        _.merge({id: 'o-11111111',}, config),
        context
      );
    })
    
    it("create handler should throw error", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .post('/ocean/aws/ecs/cluster', {"cluster": config.oceanEcs})
        .reply(400, {});
      
      util.done = sandbox.spy((err, event, context, body) => {
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
