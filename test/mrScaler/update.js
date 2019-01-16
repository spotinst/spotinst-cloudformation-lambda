var _            = require('lodash'),
    assert       = require('assert'),
    update       = require('../../lib/resources/mrScaler/update'),
    mrScaler = require('../../lib/resources/mrScaler'),
    lambda       = require('../../'),
    nock         = require('nock');

var fullGroupConfig = {
  "mrScaler":{
    "name":"Jeffrey New MRScaler",
    "description":"Spotinst MRScaler",
    "region":"us-west-2",
    "strategy":{
       "new":{
        "releaseLabel":"emr-5.17.0",
        "numberOfRetries":1
       },
       "provisioningTimeout":{
          "timeout":15,
          "timeoutAction":"terminateAndRetry"
       }
    },
    "compute":{
       "availabilityZones":[
          {
             "name":"us-west-2b",
             "subnetId":"subnet-1ba25052"
          }
       ],
       "instanceGroups":{
          "masterGroup":{
             "instanceTypes":[
                "m3.xlarge"
             ],
             "target":1,
             "lifeCycle":"ON_DEMAND"
          },
          "coreGroup":{
             "instanceTypes":[
                "m3.xlarge"
             ],
             "target":1,
             "lifeCycle":"SPOT"
          },
          "taskGroup":{
             "instanceTypes":[
                "m1.medium"
             ],
             "capacity":{
                "minimum":0,
                "maximum":30,
                "target":1
             },
             "lifeCycle":"SPOT"
          }
       },
       "emrManagedMasterSecurityGroup":"sg-8cfb40f6",
       "emrManagedSlaveSecurityGroup":"sg-f2f94288",
       "additionalMasterSecurityGroups":["sg-f2f94288"],
       "additionalSlaveSecurityGroups":["sg-8cfb40f6"],
       "ec2KeyName":"Noam-key",
       "applications":[
          {
            "name":"Ganglia",
            "version": "1.0"
          },
          {"name":"Hadoop"},
          {"name":"Hive"},
          {"name":"Hue"},
          {"name":"Mahout"},
          {"name":"Pig"},
          {"name":"Tez"}
        ]
    },
    "cluster":{
       "visibleToAllUsers":true,
       "terminationProtected":false,
       "keepJobFlowAliveWhenNoSteps": true,
       "logUri":"s3://sorex-job-status",
       "additionalInfo":"{'test':'more information'}",
       "jobFlowRole": "EMR_EC2_DefaultRole",
       "securityConfiguration":"test-config-jeffrey"
    }
  }
}

var updateGroupConfig = {
  "mrScaler":{
    "compute":{
       "instanceGroups":{
          "coreGroup":{
             "target":1,
          },
          "taskGroup":{
             "instanceTypes":[
                "m1.medium"
             ],
             "capacity":{
                "minimum":0,
                "maximum":30,
                "target":1
             },
          }
       }
    },
    "cluster":{
       "terminationProtected":false
    }
  }
}

describe("beanstalkElastigroup", function() {
  describe("update resource", function() {
    beforeEach(function() {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .put('/aws/emr/mrScaler/simrs-85e26ac5', updateGroupConfig)
        .reply(200, {});
    });


    it("update handler should update an existing group", function(done) {
      var context = {
        done: done
      };

      update.handler(
        _.merge({
          accessToken: ACCESSTOKEN,
          id:          'simrs-85e26ac5'
        }, fullGroupConfig),
        context
      );
    });

    it("mrScaler handler should update an existing group", function(done) {
      var context = {
        done: done
      };

      update.handler(
        _.merge({
          requestType: 'update',
          accessToken: ACCESSTOKEN,
          id:          'simrs-85e26ac5'
        }, fullGroupConfig),
        context
      );
    });

    it("lambda handler should update an existing group", function(done) {
      var context = {
        done: done
      };

      update.handler(
        _.merge({
          resourceType: 'mrScaler',
          requestType:  'update',
          accessToken:  ACCESSTOKEN,
          id:           'simrs-85e26ac5'
        }, fullGroupConfig),
        context
      );
    });
  });
});
