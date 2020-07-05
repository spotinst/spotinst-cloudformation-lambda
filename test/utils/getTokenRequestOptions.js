const assert = require("assert");
const util   = require("../../lib/util");

describe("util getTokenRequestOptions", () => {

  it("should return grant_type=password", () => {
    const config = {
      username:     USERNAME,
      password:     PASSWORD,
      clientId:     CLIENTID,
      clientSecret: CLIENTSECRET,
    };

    const expected = {
      method:  "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      url:     "https://oauth.spotinst.io/token",
      body:    "grant_type=password&client_id=mock.clientId&client_secret=mock.clientSecret&username=mock.username&password=mock.password",
    };

    const actual = util.getTokenRequestOptions(config);
    assert.deepStrictEqual(actual, expected);
  });

  it("should return grant_type=client_credentials", () => {
    const config = {
      accessTokenUrl: ACCESSTOKENURL,
      clientId:       CLIENTID,
      clientSecret:   CLIENTSECRET,
    };

    const expected = {
      method:  "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      url:     "https://mock.accessTokenUrl/",
      body:    "grant_type=client_credentials&client_id=mock.clientId&client_secret=mock.clientSecret",
    };

    const actual = util.getTokenRequestOptions(config);
    assert.deepStrictEqual(actual, expected);
  });

});
