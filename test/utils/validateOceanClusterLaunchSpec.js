const assert  = require("assert");
const utils   = require("../../lib/util");
const utilSpy = require("lambda-formation").util;
const nock    = require("nock");
const sinon   = require("sinon");
const _       = require("lodash");

describe("util validateOceanClusterLaunchSpec", function () {
  let sandbox, response = { res: { statusCode: 400 }, event: {}, context: {}, err: {} };

  beforeEach(() => {
    nock.cleanAll();
    sandbox = sinon.createSandbox();
  })

  afterEach(() => {
    sandbox.restore();
  });

  it("should mark deletion as success if delete failed because ecs/launchspec doesn't exist", (done) => {
    response.body = `{
      "response": {
        "errors": [
          { "code": "CANT_DELETE_OCEAN_ECS_LAUNCH_SPEC",
            "message": "does not exist"
          }
        ]
      }
    }`;


    utilSpy.done = sandbox.spy((err) => {
      assert.strictEqual(err, null);
      done();
    })

    utils.validateOceanClusterLaunchSpec(response);
  });

  it("should mark deletion as success if delete failed because k8s/launchspec doesn't exist", (done) => {
    response.body = `{
      "response": {
        "errors": [
          { "code": "CANT_DELETE_OCEAN_LAUNCH_SPEC",
            "message": "does not exist"
          }
        ]
      }
    }`;

    utilSpy.done = sandbox.spy((err) => {
      assert.strictEqual(err, null);
      done();
    })

    utils.validateOceanClusterLaunchSpec(response);
  });

  it("should not mark deletion as success if deletion error message doesn't contain `does not exist`", (done) => {
    response.body = `{
      "response": {
        "errors": [
          { "code": "CANT_DELETE_OCEAN_LAUNCH_SPEC",
            "message": "some other message"
          }
        ]
      }
    }`;

    utilSpy.done = sandbox.spy((err) => {
      assert.notStrictEqual(err, null);
      assert(err.includes(response.body));
      done();
    })

    utils.validateOceanClusterLaunchSpec(response);
  });

  it("should not mark deletion as success if response body isn't valid JSON", (done) => {
    response.body = `
      "response": {
        "errors": [
          { "code": "CANT_DELETE_OCEAN_LAUNCH_SPEC",
            "message": "some other message"
          }
        ]
      }
    }`;

    utilSpy.done = sandbox.spy((err) => {
      assert.notStrictEqual(err, null);
      assert(err.includes(response.body));
      done();
    })

    utils.validateOceanClusterLaunchSpec(response);
  });

  it("should not mark deletion as success if body.errors.code is null", (done) => {
    response.body = `{
      "response": {
        "errors": [
          { "code": null,
            "message": "some other message"
          }
        ]
      }
    }`;

    utilSpy.done = sandbox.spy((err) => {
      assert.notStrictEqual(err, null);
      assert(err.includes(response.body));
      done();
    })

    utils.validateOceanClusterLaunchSpec(response);
  });

});
