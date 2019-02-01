var _ = require('lodash'),
  assert = require('assert'),
  create = require('../../lib/resources/beanstalkElastigroup/create'),
  elasticgroup = require('../../lib/resources/beanstalkElastigroup'),
  nock         = require('nock'),
  sinon     = require('sinon'),
  util      = require('lambda-formation').util;
    
var groupConfig = {
  "accountId":"act-123456",
  "createPolicy":{
    "ignoreInitHealthChecks":true
  },
  "beanstalkElastigroup": {
    "region":"us-east-1a",
    "beanstalk":{
      "environmentName":"test",
      "environmentId":"env-12345",
    },
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
    "thirdPartiesIntegration": {
      "beanstalk":{}
    }
  }
}

describe("beanstalkElastigroup", function() {
  beforeEach(()=>{
    nock.cleanAll();
    sandbox = sinon.createSandbox();
  })

  afterEach(()=>{
    sandbox.restore()
  });

  describe("create resource", function() {
    it("create handler should create a new group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
      .post('/aws/ec2/group')
      .query({ accountId: 'act-123456', ignoreInitHealthChecks: true })
      .reply(200, {});

      nock('https://api.spotinst.io', {"encodedQueryParams": true})
      .get('/aws/ec2/group/beanstalk/import')
      .query({ accountId: 'act-123456',region: 'us-east-1a',environmentName: 'test',environmentId: 'env-12345' })
      .reply(200, {response:{items:[groupConfig]}});  

      util.done = sandbox.spy((err, event, context, body)=>{
          assert.equal(err, null)
          done()
      })

      create.handler(
        _.merge({accessToken: ACCESSTOKEN}, groupConfig),
        null
      );
    });

    it("return error from spotUtil.getTokenAndConfigs", function(done){
      util.done = sandbox.spy((err, event, context, body)=>{
          assert.notEqual(err, null)
          done()
      })
      
      create.handler(
        _.merge({
          id:           'sig-11111111',
        }, groupConfig),
        null
      );
    })

    it("should import beanstalk with managedActions", function(done){
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
      .post('/aws/ec2/group')
      .query({ accountId: 'act-123456', ignoreInitHealthChecks: true })
      .reply(200, {});

      nock('https://api.spotinst.io', {"encodedQueryParams": true})
      .get('/aws/ec2/group/beanstalk/import')
      .query({ accountId: 'act-123456',region: 'us-east-1a',environmentName: 'test',environmentId: 'env-12345' })
      .reply(200, {response:{items:[groupConfig]}});  

      util.done = sandbox.spy((err, event, context, body)=>{
          assert.equal(err, null)
          done()
      })

      let tempGroup = groupConfig

      tempGroup.beanstalkElastigroup.beanstalk.managedActions = {
        "platformUpdate": {
          "performAt"   : "timeWindow",
          "timeWindow"  : "Sun:01:00-Sun:02:00",
          "updateLevel" : "minorAndPatch"
        }
      }

      create.handler(
        _.merge({accessToken: ACCESSTOKEN}, tempGroup),
        null
      );
    })

    it("should import beanstalk with deploymentPreferences", function(done){
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
      .post('/aws/ec2/group')
      .query({ accountId: 'act-123456', ignoreInitHealthChecks: true })
      .reply(200, {});

      nock('https://api.spotinst.io', {"encodedQueryParams": true})
      .get('/aws/ec2/group/beanstalk/import')
      .query({ accountId: 'act-123456',region: 'us-east-1a',environmentName: 'test',environmentId: 'env-12345' })
      .reply(200, {response:{items:[groupConfig]}});  

      util.done = sandbox.spy((err, event, context, body)=>{
          assert.equal(err, null)
          done()
      })

      let tempGroup = groupConfig

      tempGroup.beanstalkElastigroup.beanstalk.deploymentPreferences = {
        automaticRoll: true,
        batchSizePercentage:100,
        gracePeriod:0,
        strategy:{
          action:"ROLL",
          shouldDrainInstances:false
        }
      }
      

      create.handler(
        _.merge({accessToken: ACCESSTOKEN}, tempGroup),
        null
      );
    })
  });
});
