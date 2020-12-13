const assert = require('assert');
const util   = require('../../lib/util');
const nock   = require('nock');
const sinon  = require('sinon');

describe("util getParameters", () => {
  beforeEach(() => {
    nock.cleanAll();
    sandbox = sinon.createSandbox();
  })
  afterEach(() => {
    sandbox.restore();
  });

  it(`should return {} without error`, (done) => {
    const expected = {};
    const actual   = util.getParameters({});
    assert.deepStrictEqual(actual, expected);
    done();
  });

  it(`should return {"foo": "bar"} from ".parameters.create"`, (done) => {
    const expected = { foo: "bar" };
    const actual   = util.getParameters({
      RequestType: "create",
      parameters:  {
        create: {
          foo: "bar",
        },
      },
    });
    assert.deepStrictEqual(actual, expected);
    done();
  });

  it(`should return {"foo": "bar"} from ".ResourceProperties.parameters.create"`, (done) => {
    const expected = { foo: "bar" };
    const actual   = util.getParameters({
      RequestType:        "create",
      ResourceProperties: {
        parameters: {
          create: {
            foo: "bar",
          },
        },
      },
    });
    assert.deepStrictEqual(actual, expected);
    done();
  });

  it(`should return {} from ".ResourceProperties.parameters.create"`, (done) => {
    const expected = {};
    const actual   = util.getParameters({
      RequestType:        "create",
      ResourceProperties: {
        parameters: {
          update: {
            foo: "bar",
          },
        },
      },
    });
    assert.deepStrictEqual(actual, expected);
    done();
  });

  it(`should return {"foo": "bar"} from ".OldResourceProperties.parameters.create"`, (done) => {
    const expected = { foo: "bar" };
    const actual   = util.getParameters({
      RequestType:           "create",
      OldResourceProperties: {
        parameters: {
          create: {
            foo: "bar",
          },
        },
      },
    });
    assert.deepStrictEqual(actual, expected);
    done();
  });

  it(`should return {"foo": "bar"} after merge with empty parameters`, (done) => {
    const expected = { foo: "bar" };
    const actual   = {
      foo: "bar",
      ...util.getParameters({}),
    };
    assert.deepStrictEqual(actual, expected);
    done();
  });

  it(`should return {foo: "bar", alice: "bob"} after merge with parameters`, (done) => {
    const expected = { foo: "bar", alice: "bob" };
    const actual   = {
      foo: "bar",
      ...util.getParameters({
        RequestType:        "create",
        ResourceProperties: {
          parameters: {
            create: {
              alice: "bob",
            },
          },
        },
      }),
    };
    assert.deepStrictEqual(actual, expected);
    done();
  });

});
