var _            = require('lodash'),
    assert       = require('assert'),
    update       = require('../../lib/resources/importAsg/update'),
    importAsg = require('../../lib/resources/importAsg'),
    lambda       = require('../../'),
    nock         = require('nock'),
    sinon        = require('sinon'),
    util         = require('lambda-formation').util;

var groupConfig = {
    "group": {
        "product": "Linux/UNIX",
        "spotInstanceTypes": [
            "t2.micro",
            "t2.small"
         ],
         "name": "TestASG"
    }
}


describe("importAsg", function() {
  describe("update resource", function() {

    it("update handler should throw error", function(done) {
      var context = {
        done: done
      };

      sinon.stub(util, "done").returns(done())

      update.handler(
        _.merge({
          accessToken: ACCESSTOKEN,
          id:          'sig-11111111',
        }, groupConfig),
        context
        );

      util.done.restore()

    });

    it("importAsg handler should throw error", function(done) {
      var context = {
        done: done
      };

      sinon.stub(util, "done").returns(done())

      importAsg.handler(
        _.merge({
          requestType: 'update',
          accessToken: ACCESSTOKEN,
          id:          'sig-11111111',
        }, groupConfig)
      );

      util.done.restore()

    });

  });
});
