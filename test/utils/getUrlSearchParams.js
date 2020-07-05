const assert = require("assert");
const util   = require("../../lib/util");

describe("util getUrlSearchParams", () => {

  it("should iterate over object entries", () => {
    const obj      = {
      string:  "foo",
      integer: 1,
      float:   1.1,
      boolean: true,
      null:    null,
    };
    const expected = "string=foo&integer=1&float=1.1&boolean=true&null=null";
    const actual   = util.getUrlSearchParams(obj).toString();

    assert.strictEqual(actual, expected);
  });

  it("should return an empty string for an empty object", () => {
    const obj      = {};
    const expected = "";
    const actual   = util.getUrlSearchParams(obj).toString();

    assert.strictEqual(actual, expected);
  });

  it("should return an empty string for a null object", () => {
    const obj      = null;
    const expected = "";
    const actual   = util.getUrlSearchParams(obj).toString();

    assert.strictEqual(actual, expected);
  });

});
