const assert      = require("assert");
const featureFlag = require("../../lib/featureflag");

describe("util featureFlag", () => {

  it("should return TestAlpha=false", () => {
    featureFlag.set("TestAlpha=false");

    const expected = {
      TestAlpha: false,
    };

    const actual = {
      TestAlpha: featureFlag.get("TestAlpha").enabled(),
    };

    assert.deepStrictEqual(actual, expected);
  });

  it("should return TestAlpha=true", () => {
    featureFlag.set("TestAlpha=true");

    const expected = {
      TestAlpha: true,
    };

    const actual = {
      TestAlpha: featureFlag.get("TestAlpha").enabled(),
    };

    assert.deepStrictEqual(actual, expected);
  });


  it("should return TestAlpha=false,TestBeta=true", () => {
    featureFlag.set("TestAlpha=false,TestBeta=true");

    const expected = {
      TestAlpha: false,
      TestBeta:  true,
    };

    const actual = {
      TestAlpha: featureFlag.get("TestAlpha").enabled(),
      TestBeta:  featureFlag.get("TestBeta").enabled(),
    };

    assert.deepStrictEqual(actual, expected);
  });

  it("should return TestAlpha=true,TestBeta=false", () => {
    featureFlag.set("TestAlpha=true,TestBeta=false");

    const expected = {
      TestAlpha: true,
      TestBeta:  false,
    };

    const actual = {
      TestAlpha: featureFlag.get("TestAlpha").enabled(),
      TestBeta:  featureFlag.get("TestBeta").enabled(),
    };

    assert.deepStrictEqual(actual, expected);
  });

  it("should return TestAlpha=false,TestBeta=false", () => {
    featureFlag.set("TestAlpha=false,TestBeta=false");

    const expected = {
      TestAlpha: false,
      TestBeta:  false,
    };

    const actual = {
      TestAlpha: featureFlag.get("TestAlpha").enabled(),
      TestBeta:  featureFlag.get("TestBeta").enabled(),
    };

    assert.deepStrictEqual(actual, expected);
  });

  it("should return TestAlpha=true,TestBeta=true", () => {
    featureFlag.set("TestAlpha=true,TestBeta=true");

    const expected = {
      TestAlpha: true,
      TestBeta:  true,
    };

    const actual = {
      TestAlpha: featureFlag.get("TestAlpha").enabled(),
      TestBeta:  featureFlag.get("TestBeta").enabled(),
    };

    assert.deepStrictEqual(actual, expected);
  });

  it("should return TestAlpha=true (implicit)", () => {
    featureFlag.set("TestAlpha");

    const expected = {
      TestAlpha: true,
    };

    const actual = {
      TestAlpha: featureFlag.get("TestAlpha").enabled(),
    };

    assert.deepStrictEqual(actual, expected);
  });

  it("should return TestAlpha=false,TestBeta (implicit)", () => {
    featureFlag.set("TestAlpha=false,TestBeta");

    const expected = {
      TestAlpha: false,
      TestBeta:  true,
    };

    const actual = {
      TestAlpha: featureFlag.get("TestAlpha").enabled(),
      TestBeta:  featureFlag.get("TestBeta").enabled(),
    };

    assert.deepStrictEqual(actual, expected);
  });

  it("should return TestAlpha,TestBeta (implicit)", () => {
    featureFlag.set("TestAlpha,TestBeta");

    const expected = {
      TestAlpha: true,
      TestBeta:  true,
    };

    const actual = {
      TestAlpha: featureFlag.get("TestAlpha").enabled(),
      TestBeta:  featureFlag.get("TestBeta").enabled(),
    };

    assert.deepStrictEqual(actual, expected);
  });

});
