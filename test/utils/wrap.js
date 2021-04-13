const assert   = require("assert");
const { wrap } = require("../../lib/util");

describe("util wrap", () => {

  it("should return null (null wrapper)", () => {
    const obj      = null;
    const expected = null;
    const actual   = wrap(obj, null);
    assert.deepStrictEqual(actual, expected);
  });

  it("should return null (data wrapper)", () => {
    const obj      = null;
    const expected = null;
    const actual   = wrap(obj, "data");
    assert.deepStrictEqual(actual, expected);
  });

  it("should return the same object", () => {
    const obj      = { data: { one: "two", key: "value" } };
    const expected = { data: { one: "two", key: "value" } };
    const actual   = wrap(obj, "data");
    assert.deepStrictEqual(actual, expected);
  });

  it("should return a wrapped object", () => {
    const obj      = { one: "two", key: "value" };
    const expected = { data: { one: "two", key: "value" } };
    const actual   = wrap(obj, "data");
    assert.deepStrictEqual(actual, expected);
  });

  it("should return an empty wrapped object", () => {
    const obj      = {};
    const expected = { data: {} };
    const actual   = wrap(obj, "data");
    assert.deepStrictEqual(actual, expected);
  });

  it("should return an empty unwrapped object", () => {
    const obj      = {};
    const expected = {};
    const actual   = wrap(obj, null);
    assert.deepStrictEqual(actual, expected);
  });

});
