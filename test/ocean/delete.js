var assert       = require('assert'),
    deleteOcean  = require('../../lib/resources/ocean/delete'),
    ocean        = require('../../lib/resources/ocean'),
    lambda       = require('../../'),
    nock         = require('nock'),
    sinon     = require('sinon'),
    util      = require('lambda-formation').util;

describe("ocean", function() {
  beforeEach(()=>{
    nock.cleanAll();
    sandbox = sinon.createSandbox();
  })

  afterEach(()=>{
    sandbox.restore()
  });


  describe("delete ocean resource success", function() {
    describe("delete ocean cluster variation tests", function(){
      it("delete handler should delete an existing group", function(done) {
        nock('https://api.spotinst.io', {"encodedQueryParams": true})
          .delete('/ocean/aws/k8s/cluster/o-7c1c9a42')
          .reply(200, {});

        util.done = sandbox.spy((err, event, context, body)=>{
          assert.equal(err, null)
          done()
        })

        deleteOcean.handler({
          accessToken: ACCESSTOKEN,
          id:          'o-7c1c9a42'
        }, context);
      });

      it("ocean handler should delete an existing group", function(done) {
        nock('https://api.spotinst.io', {"encodedQueryParams": true})
          .delete('/ocean/aws/k8s/cluster/o-7c1c9a42')
          .reply(200, {});

        util.done = sandbox.spy((err, event, context, body)=>{
          assert.equal(err, null)
          done()
        })

        ocean.handler({
          requestType: 'delete',
          accessToken: ACCESSTOKEN,
          id:          'o-7c1c9a42'
        }, context);
      });

      it("lambda handler should delete an existing group", function(done) {
        nock('https://api.spotinst.io', {"encodedQueryParams": true})
          .delete('/ocean/aws/k8s/cluster/o-7c1c9a42')
          .reply(200, {});

        util.done = sandbox.spy((err, event, context, body)=>{
          assert.equal(err, null)
          done()
        })

        lambda.handler({
          resourceType: 'ocean',
          requestType:  'delete',
          accessToken:  ACCESSTOKEN,
          id:           'o-7c1c9a42'
        }, context);
      });
    })

    it("should delete with autoTags", function(done){
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .get('/ocean/aws/k8s/cluster')
        .reply(200, {
          "response": {
            "status": {},
            "items":[
              {
                "id":"o-7c1c9a42",
                "compute":{"launchSpecification":{"tags":[
                  {
                    "tagKey": "spotinst:aws:cloudformation:logical-id",
                    "tagValue": "ocean"
                  },
                  {
                    "tagKey": "spotinst:aws:cloudformation:stack-id",
                    "tagValue": "arn::12345/test/67890"
                  },
                  {
                    "tagKey": "spotinst:aws:cloudformation:stack-name",
                    "tagValue": "test"
                  }
                ]}}
              }
            ]
          }
        });
      
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
          .delete('/ocean/aws/k8s/cluster/o-7c1c9a42')
          .reply(200, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      deleteOcean.handler({
        accessToken: ACCESSTOKEN,
        id:          'OceanError',
        autoTag:true,
        LogicalResourceId:"ocean",
        StackId:"arn::12345/test/67890"
      }, context);      
    })   

  });

  describe("delete ocean resource fail", function() {
    it("should fail to get token", function(done){
      util.done = sandbox.spy((err, event, context, body)=>{
        assert.notEqual(err, null)
        done()
      })

      deleteOcean.handler({
        id: 'o-11111111',
      }, context);   
    })

    it("should rollback", function(done){
      util.done = sandbox.spy((err, event, context, body)=>{
        assert.equal(err, null)
        done()
      })

      deleteOcean.handler({
        accessToken: ACCESSTOKEN,
        id:          'ResourceFailed',
        autoTag:false,
        LogicalResourceId:"ocean",
        StackId:"arn::12345/test/67890"
      }, context);      
    })   
  });
});
