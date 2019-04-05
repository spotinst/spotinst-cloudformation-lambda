var _ = require('lodash'),
    assert = require('assert'),
    create = require('../../lib/resources/oceanLaunchSpec/create'),
    ocean  = require('../../lib/resources/oceanLaunchSpec'),
    sinon  = require('sinon'),
    lambda = require('../../'),
    nock   = require('nock'),
    sinon  = require('sinon'),
    util   = require('lambda-formation').util;

var config = {
    oceanLaunchSpec: {
        oceanId: "o-cc564677",
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

describe("ocean create launch spec resource", function () {
    beforeEach(()=>{
        nock.cleanAll();
        sandbox = sinon.createSandbox();
    })

    afterEach(()=>{
        sandbox.restore()
    });

    describe("create ocean launch spec success", function () {
        it("create ocean handler should create a new launch spec", function (done) {
            nock('https://api.spotinst.io', {"encodedQueryParams": true})
                .post('/ocean/aws/k8s/launchSpec', {"launchSpec": config.oceanLaunchSpec})
                .reply(200, response);

            util.done = sandbox.spy((err, event, context, body)=>{
                assert.equal(err, null)
                done()
            })

            create.handler(
                _.merge({accessToken: 'ACCESSTOKEN'}, config),
                null
            );
        });

        it("ocean handler should create launch spec", function(done){
            nock('https://api.spotinst.io', {"encodedQueryParams": true})
            .post('/ocean/aws/k8s/launchSpec', {"launchSpec": config.oceanLaunchSpec})
            .reply(200, response);

            util.done = sandbox.spy((err, event, context, body)=>{
                assert.equal(err, null)
                done()
            })

            ocean.handler(
                _.merge({
                resourceType: 'oceanLaunchSpec',
                requestType: 'create',
                accessToken: 'ACCESSTOKEN'
                }, config),
                null
            );
        });

        it("lambda ocean handler should create launchSpec", function(done){
            nock('https://api.spotinst.io', {"encodedQueryParams": true})
                .post('/ocean/aws/k8s/launchSpec', {"launchSpec": config.oceanLaunchSpec})
                .reply(200, response);

            util.done = sandbox.spy((err, event, context, body)=>{
                assert.equal(err, null)
                done()
            })

            lambda.handler(
                _.merge({
                    resourceType: 'oceanLaunchSpec',
                    requestType: 'create',
                    accessToken: 'ACCESSTOKEN'
                }, config),
                context
            );
        });
    });

    describe("fail to create ocean launchSpecaun", function(){
        it("return error from spotUtil.getTokenAndConfigs", function(done){
          util.done = sandbox.spy((err, event, context, body)=>{
            assert.notEqual(err, null)
            done()
          })

          create.handler(
            _.merge({id:'o-11111111',}, config),
            context
          );
        })

        it("create handler should throw error", function(done) {
            nock('https://api.spotinst.io', {"encodedQueryParams": true})
                .post('/ocean/aws/k8s/launchSpec', {"launchSpec": config.oceanLaunchSpec})
                .reply(400, {});


          util.done = sandbox.spy((err, event, context, body)=>{
            assert.notEqual(err, null)
            done()
          })

          create.handler(
            _.merge({
              accessToken: 'ACCESSTOKEN',
            }, config),
            context
            );
        });
    })
});