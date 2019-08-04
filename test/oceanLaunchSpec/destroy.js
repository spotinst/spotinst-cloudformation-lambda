var assert       = require('assert'),
    deleteOcean  = require('../../lib/resources/oceanLaunchSpec/delete'),
    ocean        = require('../../lib/resources/oceanLaunchSpec'),
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


  describe("delete ocean launch spec resource success", function() {
    describe("delete ocean launchSpec variation tests", function(){
      it("delete handler should delete an existing group", function(done) {
        nock('https://api.spotinst.io', {"encodedQueryParams": true})
          .delete('/ocean/aws/k8s/launchSpec/o-7c1c9a42')
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

      it("ocean launch spec handler should delete an existing group", function(done) {
        nock('https://api.spotinst.io', {"encodedQueryParams": true})
          .delete('/ocean/aws/k8s/launchSpec/o-7c1c9a42')
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

      it("lambda launch spec handler should delete an existing group", function(done) {
        nock('https://api.spotinst.io', {"encodedQueryParams": true})
          .delete('/ocean/aws/k8s/launchSpec/o-7c1c9a42')
          .reply(200, {});

        util.done = sandbox.spy((err, event, context, body)=>{
          assert.equal(err, null)
          done()
        })

        lambda.handler({
          resourceType: 'oceanLaunchSpec',
          requestType:  'delete',
          accessToken:  ACCESSTOKEN,
          id:           'o-7c1c9a42'
        }, context);
      });
    })  

  });

  describe("delete ocean launch spec resource fail", function() {
    it("should fail to get token", function(done){
      util.done = sandbox.spy((err, event, context, body)=>{
        assert.notEqual(err, null)
        done()
      })

      deleteOcean.handler({
        id: 'o-11111111',
      }, context);   
    })
  });
});
