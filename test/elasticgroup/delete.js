var assert       = require('assert'),
    deleteGroup  = require('../../lib/resources/elasticgroup/delete'),
    elasticgroup = require('../../lib/resources/elasticgroup'),
    lambda       = require('../../'),
    nock         = require('nock'),
    sinon     = require('sinon'),
    util      = require('lambda-formation').util;

describe("elasticgroup", function() {
  beforeEach(()=>{
    nock.cleanAll();
    sandbox = sinon.createSandbox();
  })

  afterEach(()=>{
    sandbox.restore()
  });

  describe("delete resource success", function() {
    it("delete handler should delete an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .delete('/aws/ec2/group/sig-11111111')
        .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      deleteGroup.handler({
        accessToken: ACCESSTOKEN,
        id:          'sig-11111111'
      }, context);
    });

    it("elasticgroup handler should delete an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .delete('/aws/ec2/group/sig-11111111')
        .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      elasticgroup.handler({
        requestType: 'delete',
        accessToken: ACCESSTOKEN,
        id:          'sig-11111111'
      }, context);
    });

    it("lambda handler should delete an existing group", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .delete('/aws/ec2/group/sig-11111111')
        .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      lambda.handler({
        resourceType: 'elasticgroup',
        requestType:  'delete',
        accessToken:  ACCESSTOKEN,
        id:           'sig-11111111'
      }, context);
    });

    it("lambda handler should delete for CloudFormation", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .delete('/aws/ec2/group/sig-11111111')
        .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      lambda.handler({
          ResourceType:       'Custom::elasticgroup',
          ResourceProperties: {
            accessToken: ACCESSTOKEN,
          },
          RequestType:        "Delete",
          RequestId:          "unique id for this create request",
          ResponseURL:        "https://fake.url",
          LogicalResourceId:  "name of resource in template",
          PhysicalResourceId: 'sig-11111111',
          StackId:            "arn:aws:cloudformation:us-east-1:namespace:stack/stack-name/guid"
        },
        context);
    });

    it("delete group with autoTag set to true", function(done){
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .get('/aws/ec2/group')
        .reply(200, {
          response:{items:[{
            id:"sig-11111111", 
            compute:{launchSpecification:{tags:[
              {
                "tagKey": "spotinst:aws:cloudformation:logical-id",
                "tagValue": "Elastigroup"
              },
              {
                "tagKey": "spotinst:aws:cloudformation:stack-id",
                "tagValue": "arn::12345/test/67890"
              },
              {
                "tagKey": "spotinst:aws:cloudformation:stack-name",
                "tagValue": "test"
              }
            ]
            }}
          }]}
        });

      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .delete('/aws/ec2/group/sig-11111111')
        .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      deleteGroup.handler({
        accessToken: ACCESSTOKEN,
        id:          'ElastigroupError',
        autoTag:     true,
        LogicalResourceId:"Elastigroup",
        StackId:"arn::12345/test/67890"
      }, null );      
    })

    // it("fail to get groups from api call", function(done){
    //   util.done = sandbox.spy((err, event, context, body)=>{
    //     assert.equal(err, null)
    //     done()
    //   })

    //   deleteGroup.handler({
    //     accessToken: ACCESSTOKEN,
    //     id:          'ElastigroupError2',
    //     autoTag:true,
    //     LogicalResourceId:"Elastigroup",
    //     StackId:"arn::12345/test/67890"
    //   }, context);  
    // })

    // it("fail to get group from tags 1 time then success", function(done){
    //   var getAllResPass = "{\n\"request\":{\n\"id\":\"0435148a-b47b-4c0b-bdf0-66f643c5f7f1\",\n\"url\":\"/aws/ec2/group\",\n\"method\":\"GET\",\n\"timestamp\":\"2019-01-11T21:35:59.605Z\"\n},\n\"response\":{\n\"status\":{\n\"code\":200,\n\"message\":\"OK\"\n},\n\"kind\":\"spotinst:aws:ec2:group\",\n\"items\":[\n{\n\"id\":\"sig-11111111\",\n\"name\":\"targetSet\",\n\"capacity\":{\n\"minimum\":0,\n\"maximum\":2,\n\"target\":2,\n\"unit\":\"instance\"\n},\n\"strategy\":{\n\"risk\":90,\n\"availabilityVsCost\":\"balanced\",\n\"drainingTimeout\":240,\n\"lifetimePeriod\":\"days\",\n\"fallbackToOd\":true,\n\"persistence\":{},\n\"revertToSpot\":{\n\"performAt\":\"always\"\n}\n},\n\"compute\":{\n\"instanceTypes\":{\n\"ondemand\":\"m3.medium\",\n\"spot\":[\n\"m3.medium\"\n]\n},\n\"availabilityZones\":[\n{\n\"name\":\"us-west-2a\",\n\"subnetIds\":[\n\"subnet-79da021e\"\n],\n\"subnetId\":\"subnet-79da021e\"\n},\n{\n\"name\":\"us-west-2b\",\n\"subnetIds\":[\n\"subnet-1ba25052\"\n],\n\"subnetId\":\"subnet-1ba25052\"\n},\n{\n\"name\":\"us-west-2c\",\n\"subnetIds\":[\n\"subnet-03b7ed5b\"\n],\n\"subnetId\":\"subnet-03b7ed5b\"\n}\n],\n\"product\":\"Linux/UNIX\",\n\"launchSpecification\":{\n\"healthCheckType\":\"EC2\",\n\"healthCheckGracePeriod\":300,\n\"securityGroupIds\":[\n\"sg-1a29b065\"\n],\n\"monitoring\":false,\n\"ebsOptimized\":false,\n\"imageId\":\"ami-0ad81272\",\n\"keyPair\":\"DanielleKeyPair\",\n\"userData\":\"IyEvYmluL2Jhc2gKc2xlZXAgNjAKL29wdC9uZ2lueC9zYmluL25naW54\",\n\"tags\":[\n{{\"tagKey\":\"spotinst:aws:cloudformation:logical-id\",\"tagValue\": \"Elastigroup\"},{ \"tagKey\": \"spotinst:aws:cloudformation:stack-id\",\"tagValue\": \"arn::12345/test/67890\"},{ \"tagKey\": \"spotinst:aws:cloudformation:stack-name\",\"tagValue\": \"test\"},\n {\"tagKey\":\"creator\",\n\"tagValue\":\"yael@spotinst.com\"\n},\n{\n\"tagKey\":\"spotinst:aws:cloudformation:logical-id\",\n\"tagValue\":\"SpotinstElastigroup21\"\n},\n{\n\"tagKey\":\"spotinst:aws:cloudformation:stack-id\",\n\"tagValue\":\"arn:aws:cloudformation:us-west-2:842422002533:stack/error/ce6ff330-15e8-11e9-8158-067bdfc711c4\"\n},\n{\n\"tagKey\":\"spotinst:aws:cloudformation:stack-name\",\n\"tagValue\":\"error\"\n}\n],\n\"tenancy\":\"default\"\n}\n},\n\"scaling\":{},\n\"scheduling\":{},\n\"thirdPartiesIntegration\":{},\n\"createdAt\":\"2019-01-11T21:35:44.000Z\",\n\"updatedAt\":\"2019-01-11T21:35:44.000Z\"\n}\n],\n\"count\":29\n}\n}"
    //   var getAllResFail = "{\n\"request\":{\n\"id\":\"0435148a-b47b-4c0b-bdf0-66f643c5f7f1\",\n\"url\":\"/aws/ec2/group\",\n\"method\":\"GET\",\n\"timestamp\":\"2019-01-11T21:35:59.605Z\"\n},\n\"response\":{\n\"status\":{\n\"code\":200,\n\"message\":\"OK\"\n},\n\"kind\":\"spotinst:aws:ec2:group\",\n\"items\":[\n{\n\"id\":\"sig-11111111\",\n\"name\":\"targetSet\",\n\"capacity\":{\n\"minimum\":0,\n\"maximum\":2,\n\"target\":2,\n\"unit\":\"instance\"\n},\n\"strategy\":{\n\"risk\":90,\n\"availabilityVsCost\":\"balanced\",\n\"drainingTimeout\":240,\n\"lifetimePeriod\":\"days\",\n\"fallbackToOd\":true,\n\"persistence\":{},\n\"revertToSpot\":{\n\"performAt\":\"always\"\n}\n},\n\"compute\":{\n\"instanceTypes\":{\n\"ondemand\":\"m3.medium\",\n\"spot\":[\n\"m3.medium\"\n]\n},\n\"availabilityZones\":[\n{\n\"name\":\"us-west-2a\",\n\"subnetIds\":[\n\"subnet-79da021e\"\n],\n\"subnetId\":\"subnet-79da021e\"\n},\n{\n\"name\":\"us-west-2b\",\n\"subnetIds\":[\n\"subnet-1ba25052\"\n],\n\"subnetId\":\"subnet-1ba25052\"\n},\n{\n\"name\":\"us-west-2c\",\n\"subnetIds\":[\n\"subnet-03b7ed5b\"\n],\n\"subnetId\":\"subnet-03b7ed5b\"\n}\n],\n\"product\":\"Linux/UNIX\",\n\"launchSpecification\":{\n\"healthCheckType\":\"EC2\",\n\"healthCheckGracePeriod\":300,\n\"securityGroupIds\":[\n\"sg-1a29b065\"\n],\n\"monitoring\":false,\n\"ebsOptimized\":false,\n\"imageId\":\"ami-0ad81272\",\n\"keyPair\":\"DanielleKeyPair\",\n\"userData\":\"IyEvYmluL2Jhc2gKc2xlZXAgNjAKL29wdC9uZ2lueC9zYmluL25naW54\",\n\"tags\":[\n{\n\"tagKey\":\"creator\",\n\"tagValue\":\"yael@spotinst.com\"\n},\n{\n\"tagKey\":\"spotinst:aws:cloudformation:logical-id\",\n\"tagValue\":\"Elastigroup\"\n},\n{\n\"tagKey\":\"spotinst:aws:cloudformation:stack-id\",\n\"tagValue\":\"arn::12345/test/67890\"\n},\n{\n\"tagKey\":\"spotinst:aws:cloudformation:stack-name\",\n\"tagValue\":\"test\"\n}\n],\n\"tenancy\":\"default\"\n}\n},\n\"scaling\":{},\n\"scheduling\":{},\n\"thirdPartiesIntegration\":{},\n\"createdAt\":\"2019-01-11T21:35:44.000Z\",\n\"updatedAt\":\"2019-01-11T21:35:44.000Z\"\n}\n],\n\"count\":29\n}\n}"

    //   util.done = sandbox.spy((err, event, context, body)=>{
    //     assert.equal(err, null)
    //     done()
    //   })

    //   deleteGroup.handler({
    //     accessToken: ACCESSTOKEN,
    //     id:          'ElastigroupError3',
    //     autoTag:true,
    //     LogicalResourceId:"Elastigroup",
    //     StackId:"arn::12345/test/67890"
    //   }, context);  
    // })

  });

  describe("delete resource fails", function() {
    it("should return error", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .delete('/aws/ec2/group/sig-11111111')
        .reply(400, {});

      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .get('/aws/ec2/group/sig-11111111')
        .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.notEqual(err, null)
        done()
      })

      deleteGroup.handler({
        accessToken: ACCESSTOKEN,
        id:          'sig-11111111'
      }, context);
    });

    it("should return ok", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .get('/aws/ec2/group/sig-11111111')
        .reply(400, {});

      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .delete('/aws/ec2/group/sig-11111111')
        .reply(400, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      deleteGroup.handler({
        accessToken: ACCESSTOKEN,
        id:          'sig-11111111'
      }, context);
    });
  });

  describe("delete test no setup", function(){
    it("should return error from get token", function(done) {

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.notEqual(err, null)
        done()
      })

      deleteGroup.handler({
        id:          'sig-11111111'
      }, context);
    });

    it("should rollback not delete", function(done){
      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      deleteGroup.handler({
        accessToken: ACCESSTOKEN,
        id:          'ResourceFailed'
      }, context);
    })
  })
});
