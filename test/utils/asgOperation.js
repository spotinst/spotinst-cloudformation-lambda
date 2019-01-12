var _ = require('lodash'),
  assert = require('assert'),
  nock = require('nock');
  util = require('../../lib/util');

var token = "1234567890987654321"

var asgOperation = {
  elastigroupThreshold:0,
  asgTarget:0
}
  

var groupConfig = {
  event : {
    accountId: "act-12345",
    asgOperation: asgOperation
  }, 
  context : {}, 
  updatePolicy : {},
  refId : "sig-12345", 
  token: token
}


describe("util asgOperation", function() {

  it("should roll group without error", function(done) {
    nock('https://api.spotinst.io', {reqheaders: {'Authorization': `Bearer ${token}`}})
      .post('/aws/ec2/group/sig-12345/asgOperation/scaleOnce?accountId=act-12345')
      .reply((uri, requestBody)=>{
        console.log("in the asg reply")
        assert.equal(requestBody.asgOperation.asg.target, asgOperation.asgTarget)
        assert.equal(requestBody.asgOperation.threshold, asgOperation.elastigroupThreshold)

        return(200, {test:true})
      });      

    util.asgOperation(groupConfig)
      .then((res)=>{
        assert.equal(res.err, null)
        done()
      });
  });
});