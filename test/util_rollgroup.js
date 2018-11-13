var _ = require('lodash'),
  assert = require('assert'),
  nock = require('nock');
  util = require('../lib/util');

var rollConfig = {
  batchSize: 50,
  gracePeriod: 120
}

var token = "1234567890987654321"

var groupConfig = {
  event : {accountId:"act-12345"}, 
  context : {}, 
  updatePolicy : {
    rollConfig: rollConfig
  }, 
  refId : "sig-12345", 
  token:token, 
}


describe("util rollGroup", function() {

  it("should roll group without error", function(done) {
    nock('https://api.spotinst.io', {reqheaders: {'Authorization': `Bearer ${token}`}})
      .put('/aws/ec2/group/sig-12345/roll?accountId=act-12345')
      .reply((uri, requestBody)=>{
        console.log("in the reply")
        assert.deepEqual(requestBody, rollConfig)
        console.log(this.req)

        return(200, {test:true})
      });

    groupConfig.context = {done:done}
      

    util.rollGroup(groupConfig);
  });
});