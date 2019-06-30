var _            = require('lodash'),
    assert       = require('assert'),
    update       = require('../../lib/resources/elasticgroup/update'),
    elasticgroup = require('../../lib/resources/elasticgroup'),
    lambda       = require('../../'),
    nock         = require('nock'),
    sinon     = require('sinon'),
    util      = require('lambda-formation').util;

var groupConfig = {
  "group": {
    "name":                    "test",
    "description":             "asdf",
    "strategy":                {
      "risk":               100,
      "onDemandCount":      null,
      "availabilityVsCost": "balanced"
    },
    "capacity":                {
      "target":  1,
      "minimum": 1,
      "maximum": 1
    },
    "scaling":                 {},
    "compute":                 {
      "instanceTypes":       {
        "ondemand": "m3.medium",
        "spot":     [
          "m3.medium"
        ]
      },
      "availabilityZones":   [
        {
          "name":     "us-east-1a",
          "subnetId": "subnet-11111111"
        }
      ],
      "product":             "Linux/UNIX",
      "launchSpecification": {
        "securityGroupIds": [
          "sg-11111111"
        ],
        "monitoring":       false,
        "imageId":          "ami-60b6c60a",
        "keyPair":          "testkey"
      }
    },
    "scheduling":              {},
    "thirdPartiesIntegration": {}
  }
};

let groupConfigEcsIntegration = {
  "group": {
    "name":                    "test",
    "description":             "asdf",
    "strategy":                {
      "risk":               100,
      "onDemandCount":      null,
      "availabilityVsCost": "balanced"
    },
    "capacity":                {
      "target":  1,
      "minimum": 1,
      "maximum": 1
    },
    "scaling":                 {},
    "compute":                 {
      "instanceTypes":       {
        "ondemand": "m3.medium",
        "spot":     [
          "m3.medium"
        ]
      },
      "availabilityZones":   [
        {
          "name":     "us-east-1a",
          "subnetId": "subnet-11111111"
        }
      ],
      "product":             "Linux/UNIX",
      "launchSpecification": {
        "securityGroupIds": [
          "sg-11111111"
        ],
        "monitoring":       false,
        "imageId":          "ami-60b6c60a",
        "keyPair":          "testkey"
      }
    },
    "scheduling":              {},
    "thirdPartiesIntegration": {
      "ecs": {
        "clusterName": "test-cluster",
        "autoScale": {
          "isEnabled": true,
          "cooldown": 300,
          "isAutoConfig": true,
          "shouldScaleDownNonServiceTasks": false
        },
        "batch": {
          "jobQueueNames": [
            "fromorQueue"
          ]
        }
      }
    }
  }
};

groupConfig.group.description = Date.now() / 1000 + "";
groupConfigEcsIntegration.group.description = Date.now() / 1000 + "";

describe("elasticgroup", function() {
  beforeEach(()=>{
      sandbox = sinon.createSandbox();
  })

  afterEach(()=>{
      sandbox.restore()
  });

  describe("update resource", function() {
    it("update handler should update an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .put('/aws/ec2/group/sig-11111111', { "group": { "name": "test", "description": /.+/, "strategy": { "risk": 100, "onDemandCount": null, "availabilityVsCost": "balanced" }, "capacity": { "target":  1,  "minimum": 1, "maximum": 1 }, "scaling": {}, "compute": { "instanceTypes": { "ondemand": "m3.medium", "spot": ["m3.medium"] }, "availabilityZones": [{ "name": "us-east-1a", "subnetId": "subnet-11111111" }], "launchSpecification": { "securityGroupIds": ["sg-11111111"], "monitoring": false, "imageId": "ami-60b6c60a", "keyPair":"testkey"}},"scheduling": {},"thirdPartiesIntegration": {}}})
        .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      update.handler(
        _.merge({
          accessToken: ACCESSTOKEN,
          id:          'sig-11111111'
        }, groupConfig),
        context
      );
    });

    it("elasticgroup handler should update an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .put('/aws/ec2/group/sig-11111111', { "group": { "name": "test", "description": /.+/, "strategy": { "risk": 100, "onDemandCount": null, "availabilityVsCost": "balanced" }, "capacity": { "target":  1,  "minimum": 1, "maximum": 1 }, "scaling": {}, "compute": { "instanceTypes": { "ondemand": "m3.medium", "spot": ["m3.medium"] }, "availabilityZones": [{ "name": "us-east-1a", "subnetId": "subnet-11111111" }], "launchSpecification": { "securityGroupIds": ["sg-11111111"], "monitoring": false, "imageId": "ami-60b6c60a", "keyPair":"testkey"}},"scheduling": {},"thirdPartiesIntegration": {}}})
        .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      elasticgroup.handler(
        _.merge({
          requestType: 'Update',
          accessToken: ACCESSTOKEN,
          id:          'sig-11111111'
        }, groupConfig),
        context
      );
    });

    it("update handler should update an existing group and roll", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .put('/aws/ec2/group/sig-11111111', { "group": { "name": "test", "description": /.+/, "strategy": { "risk": 100, "onDemandCount": null, "availabilityVsCost": "balanced" }, "capacity": { "target":  1,  "minimum": 1, "maximum": 1 }, "scaling": {}, "compute": { "instanceTypes": { "ondemand": "m3.medium", "spot": ["m3.medium"] }, "availabilityZones": [{ "name": "us-east-1a", "subnetId": "subnet-11111111" }], "launchSpecification": { "securityGroupIds": ["sg-11111111"], "monitoring": false, "imageId": "ami-60b6c60a", "keyPair":"testkey"}},"scheduling": {},"thirdPartiesIntegration": {}}})
        .reply(200, {});

      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .put('/aws/ec2/group/sig-11111111/roll')
        .reply(200, {});


      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      var updatePolicyConfig = {
        shouldRoll: true,
        rollConfig: {
          batchSizePercentage: 50,
          gracePeriod:         600
        }
      };

      update.handler(
        _.merge({
          accessToken:  ACCESSTOKEN,
          id:           'sig-11111111',
          updatePolicy: updatePolicyConfig
        }, groupConfig),
        context
      );
    });
  
    it("update handler should update an existing group with ecs integration and preform cluster roll", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .put('/aws/ec2/group/sig-11111111', { "group": { "name": "test", "description": /.+/, "strategy": { "risk": 100, "onDemandCount": null, "availabilityVsCost": "balanced" }, "capacity": { "target":  1,  "minimum": 1, "maximum": 1 }, "scaling": {}, "compute": { "instanceTypes": { "ondemand": "m3.medium", "spot": ["m3.medium"] }, "availabilityZones": [{ "name": "us-east-1a", "subnetId": "subnet-11111111" }], "launchSpecification": { "securityGroupIds": ["sg-11111111"], "monitoring": false, "imageId": "ami-60b6c60a", "keyPair":"testkey"}},"scheduling": {},"thirdPartiesIntegration": {
              "ecs": {
                "clusterName": "test-cluster",
                "autoScale": {
                  "isEnabled": true,
                  "cooldown": 300,
                  "isAutoConfig": true,
                  "shouldScaleDownNonServiceTasks": false
                },
                "batch": {
                  "jobQueueNames": [
                    "fromorQueue"
                  ]
                }
              }
            }}})
        .reply(200, {});
    
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .post('/aws/ec2/group/sig-11111111/clusterRoll')
        .reply(200, {});
    
    
      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })
    
      let updatePolicyConfig = {
        shouldRoll: true,
        rollConfig: {
          roll: {
            batchSizePercentage: 50
          }
        }
      };
    
      update.handler(
        _.merge({
          accessToken:  ACCESSTOKEN,
          id:           'sig-11111111',
          updatePolicy: updatePolicyConfig
        }, groupConfigEcsIntegration),
        context
      );
    });

    it("update handler should update an existing group and not perform roll", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .put('/aws/ec2/group/sig-11111111', { "group": { "name": "test", "description": /.+/, "strategy": { "risk": 100, "onDemandCount": null, "availabilityVsCost": "balanced" }, "capacity": { "target":  1,  "minimum": 1, "maximum": 1 }, "scaling": {}, "compute": { "instanceTypes": { "ondemand": "m3.medium", "spot": ["m3.medium"] }, "availabilityZones": [{ "name": "us-east-1a", "subnetId": "subnet-11111111" }], "launchSpecification": { "securityGroupIds": ["sg-11111111"], "monitoring": false, "imageId": "ami-60b6c60a", "keyPair":"testkey"}},"scheduling": {},"thirdPartiesIntegration": {}}})
        .reply(200, {});


      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      var updatePolicyConfig = {
        shouldRoll: false,
        rollConfig: {
          batchSizePercentage: 50,
          gracePeriod:         600
        }
      };

      update.handler(
        _.merge({
          accessToken:  ACCESSTOKEN,
          id:           'sig-11111111',
          updatePolicy: updatePolicyConfig
        }, groupConfig),
        context
      );
    });

    it("return error from spotUtil.getTokenAndConfig", function(done){
      util.done = sandbox.spy((err, event, context, body)=>{
        assert.notEqual(err, null)
        done()
      })

      update.handler(
        _.merge({id: 'sig-11111111'}, groupConfig),
        context
      );
    })

  });
});
