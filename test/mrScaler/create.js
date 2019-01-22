var _ = require('lodash'),
  assert = require('assert'),
  create = require('../../lib/resources/mrScaler/create'),
  mrScaler = require('../../lib/resources/mrScaler'),
  lambda = require('../../'),
  nock         = require('nock'),
  sinon        = require('sinon'),
  util         = require('lambda-formation').util;


var groupConfig = {
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

var groupRes = {
  "request": {
      "id": "21730999-425b-4695-af76-818d6c40047c",
      "url": "/aws/emr/mrScaler?accountId=act-92d45673",
      "method": "POST",
      "timestamp": "2019-01-16T19:43:32.078Z"
  },
  "response": {
      "status": {
          "code": 200,
          "message": "OK"
      },
      "kind": "spotinst:aws:emr:mrScaler",
      "items": [
          {
              "id": "simrs-85e26ac5",
              "name": "Jeffrey New MRScaler",
              "description": "Spotinst MRScaler",
              "region": "us-west-2",
              "strategy": {
                  "provisioningTimeout": {
                      "timeout": 15,
                      "timeoutAction": "terminateAndRetry"
                  },
                  "new": {
                      "releaseLabel": "emr-5.17.0",
                      "numberOfRetries": 1
                  }
              },
              "compute": {
                  "availabilityZones": [
                      {
                          "name": "us-west-2b",
                          "subnetId": "subnet-1ba25052"
                      }
                  ],
                  "instanceGroups": {
                      "masterGroup": {
                          "instanceTypes": [
                              "m3.xlarge"
                          ],
                          "lifeCycle": "ON_DEMAND",
                          "target": 1
                      },
                      "coreGroup": {
                          "instanceTypes": [
                              "m3.xlarge"
                          ],
                          "lifeCycle": "SPOT",
                          "target": 1,
                          "capacity": {
                              "minimum": 1,
                              "maximum": 1,
                              "target": 1
                          }
                      },
                      "taskGroup": {
                          "instanceTypes": [
                              "m1.medium"
                          ],
                          "lifeCycle": "SPOT",
                          "capacity": {
                              "minimum": 0,
                              "maximum": 30,
                              "target": 1
                          }
                      }
                  },
                  "tags": [
                      {
                          "tagKey": "spotinst:aws:cloudformation:logical-id",
                          "tagValue": "SpotinstEMR1"
                      },
                      {
                          "tagKey": "spotinst:aws:cloudformation:stack-id",
                          "tagValue": "arn:aws:cloudformation:us-west-2:842422002533:stack/emr-2/fa3be8c0-19c6-11e9-8e5d-027fe4f7c9fc"
                      },
                      {
                          "tagKey": "spotinst:aws:cloudformation:stack-name",
                          "tagValue": "emr-2"
                      }
                  ],
                  "applications": [
                      {
                          "name": "Ganglia",
                          "version": "1.0"
                      },
                      {
                          "name": "Hadoop"
                      },
                      {
                          "name": "Hive"
                      },
                      {
                          "name": "Hue"
                      },
                      {
                          "name": "Mahout"
                      },
                      {
                          "name": "Pig"
                      },
                      {
                          "name": "Tez"
                      }
                  ],
                  "emrManagedMasterSecurityGroup": "sg-8cfb40f6",
                  "emrManagedSlaveSecurityGroup": "sg-f2f94288",
                  "additionalMasterSecurityGroups": [
                      "sg-f2f94288"
                  ],
                  "additionalSlaveSecurityGroups": [
                      "sg-8cfb40f6"
                  ],
                  "ec2KeyName": "Noam-key"
              },
              "cluster": {
                  "logUri": "s3://sorex-job-status",
                  "visibleToAllUsers": true,
                  "additionalInfo": "{'test':'more information'}",
                  "terminationProtected": false,
                  "jobFlowRole": "EMR_EC2_DefaultRole",
                  "keepJobFlowAliveWhenNoSteps": true,
                  "securityConfiguration": "test-config-jeffrey"
              },
              "createdAt": "2019-01-16T19:43:32.047Z",
              "updatedAt": "2019-01-16T19:43:32.047Z"
          }
      ],
      "count": 1
  }
}

describe("mrScaler", function() {
  beforeEach(()=>{
    nock.cleanAll();
    sandbox = sinon.createSandbox();
  })

  afterEach(()=>{
    sandbox.restore()
  });

  describe("create resource", function() {

    it("create handler should create a new group", function(done) {
      nock('https://api.spotinst.io')
      .post('/aws/emr/mrScaler')
      .query({ accountId: 'act-123456', ignoreInitHealthChecks: true })
      .reply(200, groupRes);

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      create.handler(
        _.merge({accessToken: ACCESSTOKEN}, groupConfig),
        null
      );
    });

    it("creates group with autoTags, input tags not found", function(done){
      nock('https://api.spotinst.io')
      .post('/aws/emr/mrScaler')
      .query({ accountId: 'act-123456', ignoreInitHealthChecks: true })
      .reply(200, groupRes);

      util.done = sandbox.spy((err, event, context, body)=>{
          assert.equal(err, null)
          done()
        })

      create.handler(
        _.merge({
          accessToken: ACCESSTOKEN, 
          autoTag:true,
          LogicalResourceId:"mrScaler",
          StackId:"arn::12345/test/67890"
        }, groupConfig),
        null
      );
    })

    it("creates group with autoTags, input tags found", function(done){
      nock('https://api.spotinst.io')
      .post('/aws/emr/mrScaler')
      .query({ accountId: 'act-123456', ignoreInitHealthChecks: true })
      .reply(200, groupRes);

      util.done = sandbox.spy((err, event, context, body)=>{
          assert.equal(err, null)
          done()
        })

      let tempConfig = groupConfig

      tempConfig.mrScaler.compute.tags = [{tagKey:"test", tagValue:"test"}] 

      create.handler(
        _.merge({
          accessToken: ACCESSTOKEN, 
          autoTag:true,
          LogicalResourceId:"mrScaler",
          StackId:"arn::12345/test/67890"
        }, tempConfig),
        null
      );
    })
  });

  describe("error creating resource", function(){
    it("return error from spotUtil.getTokenAndConfigs", function(done){
      nock('https://api.spotinst.io')
      .post('/aws/emr/mrScaler')
      .query({ accountId: 'act-123456', ignoreInitHealthChecks: true })
      .reply(200, groupRes);

      util.done = sandbox.spy((err, event, context, body)=>{
          assert.notEqual(err, null)
          done()
        })

      create.handler(
        _.merge({
          id:           'simrs-85e26ac5',
        }, groupConfig),
        null
      );
    })
    
    it("fail to create resource, RateLimitExceeded", function(done){
      nock('https://api.spotinst.io')
      .post('/aws/emr/mrScaler')
      .query({ accountId: 'act-123456', ignoreInitHealthChecks: true })
      .reply(400, {response:{errors:[{code:"RateLimitExceeded"}]}});

      util.done = sandbox.spy((err, event, context, body)=>{
          assert.notEqual(err, null)
          done()
        })

      create.handler(
        _.merge({accessToken: ACCESSTOKEN}, groupConfig),
        null
      );
    })
  })

  describe("create test no setup", function(){
    it("should return error from get token mrScaler", function(done) {

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.notEqual(err, null)
        done()
      })

      mrScaler.handler({id:'simrs-85e26ac5'}, null);
    });
  })
});
