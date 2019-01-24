var _ = require('lodash'),
    assert = require('assert'),
    create = require('../../lib/resources/importAsg/create'),
    importAsg = require('../../lib/resources/importAsg'),
    sinon = require('sinon'),
    lambda = require('../../'),
    nock         = require('nock'),
    sinon     = require('sinon'),
    util      = require('lambda-formation').util;


var groupConfig = {
    "group": {
        "product": "Linux/UNIX",
        "spotInstanceTypes": [
            "t2.micro",
            "t2.small"
         ],
         "name": "TestASG"
    }
}

var response = {
    "request": {
        "id": "498036fe-6e93-4cf9-bf47-bf113065086d",
        "url": "/aws/ec2/group/autoScalingGroup/import?region=us-west-2&autoScalingGroupName=EC2ContainerService-omer-ecs-2-EcsInstanceAsg-122XJ52FQY25W&dryRun=false",
        "method": "POST",
        "timestamp": "2018-08-29T18:09:01.465Z"
    },
    "response": {
        "status": {
            "code": 200,
            "message": "OK"
        },
        "kind": "spotinst:aws:ec2:group",
        "items": [
            {
                "id": "sig-cf19b662",
                "name": "TestASG",
                "description": "Imported from auto scaling group: EC2ContainerService-omer-ecs-2-EcsInstanceAsg-122XJ52FQY25W",
                "capacity": {
                    "minimum": 0,
                    "maximum": 0,
                    "target": 0,
                    "unit": "instance"
                },
                "strategy": {
                    "risk": 100,
                    "availabilityVsCost": "balanced",
                    "drainingTimeout": 120,
                    "fallbackToOd": true
                },
                "compute": {
                    "instanceTypes": {
                        "ondemand": "t2.medium",
                        "spot": [
                            "t2.micro",
                            "t2.small"
                        ]
                    },
                    "availabilityZones": [
                        {
                            "name": "us-west-2a",
                            "subnetId": "subnet-865816ff",
                            "subnetIds": [
                                "subnet-865816ff"
                            ]
                        }
                    ],
                    "product": "Linux/UNIX",
                    "launchSpecification": {
                        "healthCheckType": "EC2",
                        "healthCheckGracePeriod": 600,
                        "securityGroupIds": [
                            "sg-d8d454a2"
                        ],
                        "monitoring": true,
                        "ebsOptimized": false,
                        "imageId": "ami-00d4f478",
                        "iamRole": {
                            "arn": "arn:aws:iam::842422002533:instance-profile/ecsInstanceRole"
                        },
                        "keyPair": "omerkey",
                        "userData": "IyEvYmluL2Jhc2gKZWNobyBFQ1NfQ0xVU1RFUj1vbWVyLWVjcy0yID4+IC9ldGMvZWNzL2Vjcy5jb25maWc7ZWNobyBFQ1NfQkFDS0VORF9IT1NUPSA+PiAvZXRjL2Vjcy9lY3MuY29uZmlnOw==",
                        "blockDeviceMappings": [
                            {
                                "deviceName": "/dev/xvdcz",
                                "ebs": {
                                    "volumeSize": "22",
                                    "volumeType": "gp2"
                                }
                            }
                        ],
                        "networkInterfaces": [
                            {
                                "deviceIndex": 0,
                                "associatePublicIpAddress": true,
                                "deleteOnTermination": true,
                                "associateIpv6Address": false
                            }
                        ],
                        "tags": [
                            {
                                "tagKey": "Description",
                                "tagValue": "This instance is the part of the Auto Scaling group which was created through ECS Console"
                            },
                            {
                                "tagKey": "Name",
                                "tagValue": "ECS Instance - EC2ContainerService-omer-ecs-2"
                            }
                        ]
                    }
                },
                "scaling": {},
                "createdAt": "2018-08-29T18:09:01.431+0000",
                "updatedAt": "2018-08-29T18:09:01.431+0000"
            }
        ],
        "count": 1
    }
}

describe("importAsg", function () {
    beforeEach(()=>{
        nock.cleanAll();
        sandbox = sinon.createSandbox();
    })

    afterEach(()=>{
        sandbox.restore()
    });

    describe("create resource", function () {

        it("create handler should create a new group", function (done) {
            nock('https://api.spotinst.io', {"encodedQueryParams": true})
                .post('/aws/ec2/group/autoScalingGroup/import', groupConfig)
                .query({dryRun:true})
                .reply(200, response);

            nock('https://api.spotinst.io', {"encodedQueryParams": true})
                .post('/aws/ec2/group')
                .reply(200, response)

              util.done = sandbox.spy((err, event, context, body)=>{
                assert.equal(err, null)
                done()
              })

            create.handler(
                _.merge({accessToken: ACCESSTOKEN}, groupConfig),
                context
            );
        });

        it("importAsg handler should create a new group", function (done) {
            nock('https://api.spotinst.io', {"encodedQueryParams": true})
                .post('/aws/ec2/group/autoScalingGroup/import', groupConfig)
                .query({dryRun:true})
                .reply(200, response);

            nock('https://api.spotinst.io', {"encodedQueryParams": true})
                .post('/aws/ec2/group')
                .reply(200, response)

              util.done = sandbox.spy((err, event, context, body)=>{
                assert.equal(err, null)
                done()
              })

            importAsg.handler(
                _.merge({
                    requestType: 'create',
                    accessToken: ACCESSTOKEN
                }, groupConfig),
                context
            );
        });

        it("lambda handler should create a new group", function (done) {
            nock('https://api.spotinst.io', {"encodedQueryParams": true})
                .post('/aws/ec2/group/autoScalingGroup/import', groupConfig)
                .query({dryRun:true})
                .reply(200, response);

            nock('https://api.spotinst.io', {"encodedQueryParams": true})
                .post('/aws/ec2/group')
                .reply(200, response)

              util.done = sandbox.spy((err, event, context, body)=>{
                assert.equal(err, null)
                done()
              })

            lambda.handler(
                _.merge({
                    resourceType: 'importAsg',
                    requestType: 'create',
                    accessToken: ACCESSTOKEN
                }, groupConfig),
                context
            );
        });

        it("lambda handler should create a new group from CloudFormation", function (done) {
            nock('https://api.spotinst.io', {"encodedQueryParams": true})
                .post('/aws/ec2/group/autoScalingGroup/import', groupConfig)
                .query({dryRun:true})
                .reply(200, response);

            nock('https://api.spotinst.io', {"encodedQueryParams": true})
                .post('/aws/ec2/group')
                .reply(200, response)

              util.done = sandbox.spy((err, event, context, body)=>{
                assert.equal(err, null)
                done()
              })

            lambda.handler({
                    ResourceType: 'Custom::importAsg',
                    RequestType: 'create',
                    ResourceProperties: _.merge({accessToken: ACCESSTOKEN}, groupConfig)
                },
                context
            );
        });

        it("should run asgOperation", function(done){
            nock('https://api.spotinst.io', {"encodedQueryParams": true})
            .post('/aws/ec2/group/autoScalingGroup/import', groupConfig)
            .query({dryRun:true})
            .reply(200, response);

            nock('https://api.spotinst.io', {"encodedQueryParams": true})
            .post('/aws/ec2/group')
            .reply(200, response)

            nock("https://api.spotinst.io", {"encodedQueryParams": true})
            .post("/aws/ec2/group/sig-cf19b662/asgOperation/scaleOnce")
            .reply(200, {})

            util.done = sandbox.spy((err, event, context, body)=>{
                assert.equal(err, null)
                done()
            })

          importAsg.handler(
            _.merge({
              requestType: 'create',
              accessToken: ACCESSTOKEN,
              asgOperation:{
                elastigroupThreshold:0,
                asgTarget:0
                }
            }, groupConfig), 
            context
          );
        })

    });
});
