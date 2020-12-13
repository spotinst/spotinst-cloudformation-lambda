const assert = require('assert');
const util   = require('../../lib/util');
const nock   = require('nock');
const sinon  = require('sinon');

describe("util getAccountId", () => {
  beforeEach(() => {
    nock.cleanAll();
    sandbox = sinon.createSandbox();
  })

  afterEach(() => {
    sandbox.restore();
  });

  it("should get account id without error", (done) => {
    const event = { accountId: "act-12345" };
    assert.strictEqual(util.getAccountId(event), "act-12345");
    done();
  });

});
