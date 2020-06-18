var _      = require('lodash'),
    assert = require('assert'),
    update = require('../../lib/resources/oceanLaunchSpec/update'),
    ocean  = require('../../lib/resources/oceanLaunchSpec'),
    lambda = require('../../'),
    nock   = require('nock'),
    sinon  = require('sinon'),
    util   = require('lambda-formation').util;

var config = {
    oceanLaunchSpec: {
        imageId: "ocean.k8s1",
        userData: "dsa89d7uosduxq98sau9s8aux9s8aux09q0qu09axsuix0s9qas09xz",
        labels:[
            {key: "creator", value: "kevin"}
        ],
        taints:[
            { key: "taintKey", value: "taintValue", effect: "NoSchedule"}
        ]
    }
}

var response = {
    "request": {},
    "response": {
        "status": {
            "code": 200,
            "message": "OK"
        },
        "items": [{
            oceanId: "o-cc564677",
            imageId: "ocean.k8s1",
            userData: "dsa89d7uosduxq98sau9s8aux9s8aux09q0qu09axsuix0s9qas09xz",
            labels:[
                {key: "creator", value: "kevin"}
            ],
            taints:[
                { key: "taintKey", value: "taintValue", effect: "NoSchedule"}
            ]
        }],
        "count": 1
    }
}


describe("update ocean", function() {
  beforeEach(()=>{
    nock.cleanAll();
    sandbox = sinon.createSandbox();
  })

  afterEach(()=>{
    sandbox.restore()
  });

  describe("update ocean launch spec success", function() {
    describe("update ocean launch spec variation tests", function(){
      it("update handler should update a new launch spec", function (done) {
          nock('https://api.spotinst.io', {"encodedQueryParams": true})
            .put('/ocean/aws/k8s/launchSpec/o-7c1c9a42', {"launchSpec": config.oceanLaunchSpec})
            .reply(200, response);

          util.done = sandbox.spy((err, event, context, body)=>{
            assert.equal(err, null)
            done()
          })

          update.handler(
              _.merge({
                accessToken: ACCESSTOKEN,
                id: "o-7c1c9a42"
              }, config),
              context
          );
      });

      it("ocean handler should update a new launch spec", function(done){
          nock('https://api.spotinst.io', {"encodedQueryParams": true})
            .put('/ocean/aws/k8s/launchSpec/o-7c1c9a42', {"launchSpec": config.oceanLaunchSpec})
            .reply(200, response);

          util.done = sandbox.spy((err, event, context, body)=>{
            assert.equal(err, null)
            done()
          })

          ocean.handler(
              _.merge({
                  resourceType: 'oceanLaunchSpec',
                  requestType: 'update',
                  id: "o-7c1c9a42",
                  accessToken: ACCESSTOKEN
              }, config),
              context
          );
      });

      it("lambda handler should update a new launch spec", function(done){
          nock('https://api.spotinst.io', {"encodedQueryParams": true})
            .put('/ocean/aws/k8s/launchSpec/o-7c1c9a42', {"launchSpec": config.oceanLaunchSpec})
            .reply(200, response);

          util.done = sandbox.spy((err, event, context, body)=>{
            assert.equal(err, null)
            done()
          })

          lambda.handler(
              _.merge({
                  resourceType: 'oceanLaunchSpec',
                  requestType: 'update',
                  id: "o-7c1c9a42",
                  accessToken: ACCESSTOKEN
              }, config),
              context
          );
      });
    })

  })

  describe("update ocean launch spec fails", function(){
    it("return error from spotUtil.getTokenAndConfig", function(done){
      util.done = sandbox.spy((err, event, context, body)=>{
        assert.notEqual(err, null)
        done()
      })

      update.handler(
        _.merge({
          id: 'o-11111111',
        }, config),
        context
      );
    })

    it("update handler should throw error", function(done) {
      nock('https://api.spotinst.io', {"encodedQueryParams": true})
        .put('/ocean/aws/k8s/launchSpec/o-7c1c9a42', {"launchSpec": config.oceanLaunchSpec})
        .reply(400, {});

      util.done = sandbox.spy((err, event, context, body)=>{
        assert.notEqual(err, null)
        done()
      })

      update.handler(
        _.merge({
          accessToken: ACCESSTOKEN,
          id:          "o-7c1c9a42",
        }, config),
        context
        );
    });
  })
});

