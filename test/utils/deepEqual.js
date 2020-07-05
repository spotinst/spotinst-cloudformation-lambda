const assert = require("assert");
const util   = require("../../lib/util");

describe("util deepEqual", () => {

  it("should return false when compared to an empty object", () => {
    const obj1 = {
      name:        "my object",
      description: "it's an object!",
      details:     {
        it:   "has",
        an:   "array",
        with: ["a", "few", "elements"],
      },
    };

    const expected = false;
    const actual   = util.deepEqualIgnorePaths(obj1, {});

    assert.strictEqual(actual, expected);
  });

  it("should return false when compared to a null", () => {
    const obj1 = {
      name:        "my object",
      description: "it's an object!",
      details:     {
        it:   "has",
        an:   "array",
        with: ["a", "few", "elements"],
      },
    };

    const expected = false;
    const actual   = util.deepEqualIgnorePaths(obj1, null);

    assert.strictEqual(actual, expected);
  });

  it("should return false when compared to an updated object", () => {
    const obj1 = {
      name:        "my object",
      description: "it's an object!",
      details:     {
        it:   "has",
        an:   "array",
        with: ["a", "few", "elements"],
      },
    };

    const obj2 = {
      name:        "updated object",
      description: "it's an object!",
      details:     {
        it:   "has",
        an:   "array",
        with: ["a", "few", "more", "elements", { than: "before" }],
      },
    };

    const expected = false;
    const actual   = util.deepEqualIgnorePaths(obj1, obj2);

    assert.strictEqual(actual, expected);
  });

  it("should return false when compared to an updated object without matching paths to ignore", () => {
    const obj1 = {
      name:        "my object",
      description: "it's an object!",
      details:     {
        it:   "has",
        an:   "array",
        with: ["a", "few", "elements"],
      },
    };

    const obj2 = {
      name:        "updated object",
      description: "it's an object!",
      details:     {
        it:   "has",
        an:   "array",
        with: ["a", "few", "more", "elements", { than: "before" }],
      },
    };

    const paths = [
      "doesnotexist",
    ];

    const expected = false;
    const actual   = util.deepEqualIgnorePaths(obj1, obj2, paths);

    assert.strictEqual(actual, expected);
  });

  it("should return true when compared to itself", () => {
    const obj = {
      name:        "my object",
      description: "it's an object!",
      details:     {
        it:   "has",
        an:   "array",
        with: ["a", "few", "elements"],
      },
    };

    const expected = true;
    const actual   = util.deepEqualIgnorePaths(obj, obj);

    assert.strictEqual(actual, expected);
  });

  it("should return true when compared to an updated object with specific paths to ignore", () => {
    const obj1 = {
      name:        "my object",
      description: "it's an object!",
      details:     {
        it:   "has",
        an:   "array",
        with: ["a", "few", "elements"],
      },
    };

    const obj2 = {
      name:        "updated object",
      description: "it's an object!",
      details:     {
        it:   "has",
        an:   "array",
        with: ["a", "few", "more", "elements", { than: "before" }],
      },
    };

    const paths = [
      "name",
      "details.with",
    ];

    const expected = true;
    const actual   = util.deepEqualIgnorePaths(obj1, obj2, paths);

    assert.strictEqual(actual, expected);
  });

  it("should return true when compared to an updated object with prefixed paths to ignore", () => {
    const obj1 = {
      name:        "my object",
      description: "it's an object!",
      details:     {
        it:   "has",
        an:   "array",
        with: ["a", "few", "more", "elements", { than: "before" }],
      },
    };

    const obj2 = {
      name:        "updated object",
      description: "it's an object!",
      details:     {
        it:   "has",
        an:   "array",
        with: ["a", "few", "more", "elements", { than: "earlier" }],
      },
    };

    const paths = [
      "name",
      "details.with",
    ];

    const expected = true;
    const actual   = util.deepEqualIgnorePaths(obj1, obj2, paths);

    assert.strictEqual(actual, expected);
  });

});
