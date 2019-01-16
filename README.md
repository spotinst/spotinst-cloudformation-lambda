# spotinst-lambda

A [lambda-formation](https://github.com/spotinst/lambda-formation) project that will Create, Update and Cancel [Spotinst](http://spotinst.com) resources for AWS Lambda and CloudFormation.

To view [full documentation][full-docs-url]

[![Build Status][travis-ci-image]][travis-ci-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Dependency Status][david-dm-image]][david-dm-url]

## Quick Start

    $ # Install only dependencies (no devDependencies)
    $ npm --production install
    $
    $ # create the distribution
    $ npm run dist
    $
    $ # Now upload dist/spotinst-lambda.zip to AWS Lambda, S3 or include in CloudFormation

## AWS Lambda

### parameters

#### Credentials

Use either `User Credentials` parameters or `accessCode`.  If both are provided
then `User Credentials` take precedence.

While multiple forms of credentials are supported it is highly recommended
to use a [Personal Access
Token](https://spotinst.atlassian.net/wiki/display/API/Get+API+Personal+Access+Token)

##### User Credentials

`username` - Spotinst Username

`password` - Spotinst Password

`clientId` - Client ID for Spotinst Account

`clientSecret` - Client Secret for Spotinst Account

##### Temp Credentials / Personal Access Token

`accessCode` - Short term access code retrieved using Spotinst token
service or [Personal Access
Token](https://spotinst.atlassian.net/wiki/display/API/Get+API+Personal+Access+Token)


#### handler
index/handler

**Params**

In addition to one of the credential parameter groups:

- resourceType *required* `string` - elasticgroup|subscription

- requestType *required* `string` - create|update|delete

- group `object` - Spotinst group definition. Required for `elasticgroup` create|update, not used for delete

- subscription `object` - Spotinst group definition. Required for `subscription` create|update, not used for delete

- id `string` - required for update|delete

## CloudFormation

Set the resource `Type` to  `Custom::elasticgroup` or `Custom::subscription`


## Examples

### Lambda - create elasticgroup

    {
      "accessToken": TOKEN
      "requestType": "create",
      "resourceType": "elasticgroup",
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
              "subnetId": SUBNET_ID
            }
          ],
          "launchSpecification": {
            "monitoring": false,
            "imageId": "ami-60b6c60a",
            "keyPair": "kevinkey",
            "securityGroupIds": [
              SECURITY_GROUP_ID
            ]
          },
          "product": "Linux/UNIX"
        },
        "scheduling": {},
        "thirdPartiesIntegration": {}
      }
    }

### Ocean

```
Resources: 
  SpotinstOcean: 
    Type: "Custom::ocean"
    Properties: 
      accessToken: !Ref SpotinstToken
      accountId: !Ref SpotinstAccountId
      autoTag: true
      ocean:
        name: !Ref OceanName
        controllerClusterId: !Ref ControllerClusterId
        region: !Sub ${AWS::Region}
        autoScaler:
          isEnabled: true
          cooldown: 180
          resourceLimits:
            maxMemoryGib: 1500
            maxVCpu: 750
          down:
            evaluationPeriods: 3
          headroom:
            cpuPerUnit: 2000
            memoryPerUnit: 0
            numOfUnits: 4
          isAutoConfig: false
        capacity:
          minimum: 0
          maximum: 1
          target: 1
        strategy:
          spotPercentage: 100
          fallbackToOd: true
          utilizeReservedInstances: false
        compute:
          subnetIds:
            - ""
          instanceTypes:
            whitelist:
              - "c4.8xlarge"
            # blacklist:
            #   - "c4.8xlarge"
          launchSpecification:
            imageId: ""
            # userData: "12345678987654321"
            securityGroupIds:
              - ""
            # iamInstanceProfile:
            #   arn: ""
            keyPair: ""
            tags:
              - tagKey: "creator"
                tagValue: "testing"
```

### MrScaler

```
  "Resources": {
    "SpotinstEMR": {
      "Type": "Custom::mrScaler",
      "Properties": {
        "ServiceToken": "arn:aws:lambda:us-west-2:842422002533:function:spotinst-cloudformation",
        "accessToken": "Your Token",
        "accountId": "Your Account ID",
        "autoTag":true,
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
             "terminationProtected":true,
             "keepJobFlowAliveWhenNoSteps": true,
             "logUri":"s3://sorex-job-status",
             "additionalInfo":"{'test':'more information'}",
             "jobFlowRole": "EMR_EC2_DefaultRole",
             "securityConfiguration":"test-config-jeffrey"
          }
        }
      }
    },
  }
```


[code-climate-image]: https://codeclimate.com/github/spotinst/spotinst-lambda/badges/gpa.svg?branch=master
[code-climate-url]: https://codeclimate.com/github/spotinst/spotinst-lambda?branch=master
[travis-ci-image]: https://travis-ci.org/spotinst/spotinst-lambda.svg?branch=master
[travis-ci-url]: https://travis-ci.org/spotinst/spotinst-lambda?branch=master
[coveralls-image]: https://coveralls.io/repos/spotinst/spotinst-lambda/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/r/spotinst/spotinst-lambda?branch=master
[david-dm-image]: https://david-dm.org/spotinst/spotinst-lambda.svg?branch=master
[david-dm-url]: https://david-dm.org/spotinst/spotinst-lambda?branch=master
[full-docs-url]: https://api.spotinst.com/provisioning-ci-cd-sdk/provisioning-tools/cloudformation/
