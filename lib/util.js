var _           = require('lodash');
var util        = require('lambda-formation').util;
var request     = require('request');
var diff        = require('deep-diff');
var packageJson = require('../package');

const RESOURCES = [
  'action',
  'alert',
  'beanstalkElastigroup',
  'group',
  'healthCheck',
  'mrScaler',
  'spectrumAlert',
  'subscription',
  'asg'
];

const SPOTINST_CF_USER_AGENT = 'spotinst-cloud-formation' + '/' + packageJson.version;

function getToken(event, cb) {
  var config = event.ResourceProperties || event;

  if(config.username && config.password && config.clientId && config.clientSecret) {
    var request      = require('request');
    var tokenOptions = {
      method:  'POST',
      url:     'https://oauth.spotinst.io/token',
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      body:    'username=' + config.username + '&password=' + config.password + '&grant_type=password&client_id=' + config.clientId + '&client_secret=' + config.clientSecret
    };
    request(tokenOptions, function(err, response, body) {
      if(err) return cb("Token creation failed: " + err);
      if(response.statusCode > 201) return cb("Token creation failed: " + response.statusMessage);

      var accessToken = JSON.parse(body)['response']['items'][0]['accessToken'];
      cb(null, accessToken);
    });
  }
  else if(config.accessToken) {
    cb(null, config.accessToken);
  }
  else {
    cb("No valid long or short term credentials provided");
  }
}

function addNulls(oldConfig, newConfig) {
  var patchConfig = _.cloneDeep(newConfig);

  diff.observableDiff(oldConfig, patchConfig, function(d) {
    if(d.kind === "D") {
      var patch = new Object();
      Object.defineProperty(patch, "kind", {
        value:      "N",
        enumerable: true
      });
      Object.defineProperty(patch, "path", {
        value:      d.path,
        enumerable: true
      });
      Object.defineProperty(patch, "rhs", {
        value:      null,
        enumerable: true
      });

      diff.applyChange(patchConfig, oldConfig, patch);
    }
  });

  return patchConfig;
}

function getConfig(event, cb) {
  var config;

  if(event.ResourceProperties) {
    var matchResourceConfig = _.intersection(_.keys(event.ResourceProperties), RESOURCES);
    if(matchResourceConfig.length === 1) {
      if(event.OldResourceProperties) {
        config = addNulls(
          event.OldResourceProperties[matchResourceConfig[0]],
          event.ResourceProperties[matchResourceConfig[0]]
        );
      }
      else {
        config = event.ResourceProperties[matchResourceConfig[0]];
      }
    }
  }
  if(!config) {
    var matchResourceConfig = _.intersection(_.keys(event), RESOURCES);
    config                  = event[matchResourceConfig[0]];
  }

  if(config) {
    cb(null, config);
  }
  /* TODO
   *else if (config.configUrl) {
   *  var tokenOptions = {
   *    method: 'GET',
   *    url: config.configUrl
   *  };
   *  request(requestOptions, function (err, response, body) {
   *    if (err) return cb(err);
   *    if (response.statusCode != 200) return cb(response.statusMessage);
   *    var jsonConfig = JSON.parse(body);
   *    cb(null,jsonConfig);
   *  });
   *}
   */
  else {
    cb(new Error("Must define groupConfig"));
  }

}

function getUserAgent() {
  return SPOTINST_CF_USER_AGENT;
}

module.exports.getUserAgent = getUserAgent;

module.exports.getToken = getToken;

module.exports.getConfig = getConfig;

module.exports.addNulls = addNulls;

module.exports.getTokenAndConfig = function(event, cb) {
  var count    = 0;
  var response = {};

  var done = function(err, name, obj) {
    if(err) return cb(err);
    count          = count + 1;
    response[name] = obj;
    if(count == 2) {
      return cb(null, response);
    }
  };

  getConfig(event, function(err, cfg) {
    done(err, 'config', cfg);
  });

  getToken(event, function(err, t) {
    done(err, 'token', t);
  });
};

module.exports.validateResponse = function(spotResponse) {
  var res     = spotResponse.res;
  var body    = spotResponse.body;
  var event   = spotResponse.event;
  var context = spotResponse.context;
  var err     = spotResponse.err;
  
  if(!_.isNull(err) || (res.hasOwnProperty('statusCode') && res.statusCode > 201)) {
    var errMsg = '';
    try {
      var errors = body.response.errors;
      errors.forEach(function(error) {
        errMsg = errMsg + error.code + ": " + error.message + "\n";
      });
    }
    catch(e) {
      errMsg = res.statusCode;
    }
    
    if(spotResponse.failureCb != null) {
      spotResponse.errMsg = errMsg;
      spotResponse.failureCb(spotResponse);
    }
    else {
      let error = spotResponse.resource + " " + spotResponse.action + " failed: " + errMsg
      return util.done(error, event, context, null, "Resource Failed");
    }
  }
  else {
    spotResponse.successCb(spotResponse);
  }
};

module.exports.parseBoolean = function(str) {
  let retVal;
  
  if(str != null) {
    if(_.isString(str)) {
      if(str === 'true') {
        retVal = true;
      }
      else if(str === 'false') {
        retVal = false;
      }
    }
    else if(_.isBoolean(str)) {
      retVal = str;
    }
  }
  
  return retVal;
};

module.exports.parseBoolean = function(str) {
  let retVal;
  
  if(str != null) {
    if(_.isString(str)) {
      if(str === 'true') {
        retVal = true;
      }
      else if(str === 'false') {
        retVal = false;
      }
    }
    else if(_.isBoolean(str)) {
      retVal = str;
    }
  }
  
  return retVal;
};

module.exports.getSpotinstAccountId = function(event) {
  console.log("acctId Full Event: " + event);
  var accountId = _.get(event, 'ResourceProperties.accountId') || _.get(event, 'accountId');
  if (!accountId) {
    console.log(_.get(event, 'OldResourceProperties'));
    accountId = _.get(event, 'OldResourceProperties.accountId');
  }
  console.log('spotinst account id is: ', accountId);
  return accountId;
};


module.exports.parseGroupConfig = function(config) {
  let retVal          = _.cloneDeep(config);
  let targetGroupARNs = _.get(config, 'compute.launchSpecification.loadBalancersConfig.targetGroupARNs');

  if(targetGroupARNs != null) {
    let loadBalancers = _.get(config, 'compute.launchSpecification.loadBalancersConfig.loadBalancers') || [];
    
    _.forEach(targetGroupARNs, tgARN => {
      let isTGExists = _.find(loadBalancers, {arn: tgARN}) != null;
      
      if(isTGExists === false) {
        loadBalancers.push({
          name: tgARN.split('/')[1],
          arn:  tgARN,
          type: 'TARGET_GROUP'
        });
      }
    });
    
    if(_.isEmpty(loadBalancers) === false) {
      _.set(retVal, 'compute.launchSpecification.loadBalancersConfig.loadBalancers', loadBalancers);
    }
    
    _.set(retVal, 'compute.launchSpecification.loadBalancersConfig.targetGroupARNs', undefined);
  }
  
  return retVal;
};




/**
 * This function creates a group with two config files, one that is created from an import api call and one
 * that is from the Cloudformation template. The two are merged together then sent to the create group endpoint
 *
 * @function
 * @name createGroup
 *
 * @param {Object} importedConfig - Config from import api call
 * @param {Object} groupConfig - Config from Cloudformation template
 * @param {Object} event - Event from serverless call
 * @param {Object} context - Context from serverless call
 * @param {String} token - Spotinst API token
 * @param {String} accountId - Spotinst Account Id
 *
 * @property {String} asg name string 
 */
module.exports.createGroupFromImport = function(importedConfig, groupConfig, event, context, token, accountId) {
  if(groupConfig.capacity){ 
    _.set(importedConfig, 'capacity', groupConfig.capacity);
  }

  if(groupConfig.spotInstanceTypes) {
    _.set(importedConfig, 'compute.instanceTypes.spot', groupConfig.spotInstanceTypes);
  }

  if(groupConfig.product){
    _.set(importedConfig, 'compute.product', groupConfig.product);
  }
  
  if(groupConfig.healthCheckType != null) {
    _.set(importedConfig, 'compute.launchSpecification.healthCheckType', groupConfig.healthCheckType);
  }
  
  if(groupConfig.healthCheckGracePeriod != null) {
    _.set(importedConfig, 'compute.launchSpecification.healthCheckGracePeriod', groupConfig.healthCheckGracePeriod);
  }
  
  setName();
  
  var createPolicy = getCreatePolicyConfig(event) || {};
  
  var createOptions = {
    method:  'POST',
    url:     'https://api.spotinst.io/aws/ec2/group',
    qs:      {
      accountId,
      ignoreInitHealthChecks: createPolicy.ignoreInitHealthChecks
    },
    headers: {
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + token,
      'User-Agent'   : module.exports.getUserAgent()
    },
    json:    {
      group: importedConfig
    }
  };


  console.log('Creating group from config: ' + JSON.stringify(importedConfig, null, 2));
  
  request(createOptions, function(err, res, body) {
    module.exports.validateResponse({
      err:       err,
      res:       res,
      body:      body,
      event:     event,
      context:   context,
      resource:  'elastigroup',
      action:    'create',
      successCb: function(spotResponse) {
        var options = {
          cfn_responder: {
            returnError: false,
            logLevel:    "debug"
          }
        };
        var groupId = _.get(body, 'response.items[0].id');

        if(module.exports.getAsgOperation(event) != undefined){
           module.exports.asgOperation({
            event        : event, 
            context      : context, 
            updatePolicy : module.exports.getUpdatePolicyConfig(event), 
            refId        : groupId, 
            token        : token})
        }else{
          util.done(err, event, context, {}, groupId, options);
        }
      }
    });
  });
  
  function setName() {
    let name = _.get(groupConfig, 'name');
    if(name != null && _.isEmpty(name) == false)
      _.set(importedConfig, 'name', name);
  }

  function getCreatePolicyConfig(event) {
    let createPolicy = _.get(event, 'ResourceProperties.createPolicy') || _.get(event, 'createPolicy');
    return createPolicy;
  };
}


/**
 * This function is called when the destroy function fails. it checks if the group exisists 
 *
 * @function
 * @name validateGroup
 *
 * @param {String} groupId - Elastigroup ID
 * @param {Sgtring} token - Spotinst API Token
 * @param {Object} event - Event data from Lambda
 * @param {Object} context - Context data from Lambda
 *
 * @property {String} asg name string 
 */
module.exports.validateGroup = function(groupId, token, event, context) {
  var getGroupOptions = {
    method:  'GET',
    url:     'https://api.spotinst.io/aws/ec2/group/' + groupId,
    qs:      {
      accountId: module.exports.getSpotinstAccountId(event)
    },
    headers: {
      'content-type' : 'application/json',
      'Authorization': 'Bearer ' + token,
      'User-Agent'   : module.exports.getUserAgent()
    }
  };
  
  request(getGroupOptions, function(err, res, body) {
    module.exports.validateResponse({
      err:       err,
      res:       res,
      body:      body,
      event:     event,
      context:   context,
      successCb: function(spotResponse) {
        console.log("The group does exist, fail the delete.");
        // Return failed to delete (cause the group does exist)
        util.done("Validate Failed", event, context);
      },
      failureCb: function(spotResponse) {
        // if the group doesn't exists, we can count the delete as success
        console.log("spotResponse.res.statusCode",spotResponse.res.statusCode)
        if(spotResponse.res.statusCode === 404 || spotResponse.res.statusCode === 400) {
          
          console.log("The group doesn't exist, set the delete as success.")
          try {
            body = JSON.parse(body);
          }
          catch(err) {
          }
          util.done(null, event, context, body);
        }
        else {
          util.done("can't get group", event, context);
        }
      }
    });
  });
}

/**
 * This function checks if the autoTag parameter is set if not returns false
 *
 * @function
 * @name checkAutoTag
 *
 * @param {Object} event - Event data from Lambda
 */
module.exports.checkAutoTag = function(event){
  return _.get(event, "ResourceProperties.autoTag") || _.get(event, "autoTag") || false
}

/**
 * This function auto generates tags for the elastigroup so it can be identified later 
 *
 * @function
 * @name generateTags
 *
 * @param {Object} event - Event data from Lambda
 */
module.exports.generateTags = function(event){
  let tempTags = []

  tempTags.push({tagKey:"spotinst:aws:cloudformation:logical-id", tagValue: event.LogicalResourceId})
  tempTags.push({tagKey:"spotinst:aws:cloudformation:stack-id"  , tagValue: event.StackId})
  tempTags.push({tagKey:"spotinst:aws:cloudformation:stack-name", tagValue: event.StackId.split("/")[1]})

  return tempTags
}

/**
 * This function updates the elastigroup. Used for ASG, Elastigroup and Beanstalk
 *
 * @function
 * @name generateTags
 *
 * @param {Object} obj - Contains {event: event, context: context, updatePolicy: updatePolicy, refId: refId, tc: tc, body: body}
 */
module.exports.updateGroup = function(obj) {

  if(module.exports.checkAutoTag(obj.event)){
    let autoTags = module.exports.generateTags(obj.event)

    if(module.exports.tagsExsist(obj.body)){
      autoTags.forEach((singleTag)=>{
        obj.body.compute.launchSpecification.tags.push(singleTag)
      })
    }else{
      obj.body.compute.launchSpecification.tags = autoTags
    }
  }

  let updateOptions = {
    method:  'PUT',
    url:     'https://api.spotinst.io/aws/ec2/group/' + obj.refId,
    qs:      {
      accountId:            module.exports.getSpotinstAccountId(obj.event),
      shouldResumeStateful: obj.updatePolicy.shouldResumeStateful
    },
    headers: {
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + obj.token,
      'User-Agent'   : module.exports.getUserAgent()
    },
    json:    {
      group: obj.body
    }
  };
  
  console.log('Update options: ' + JSON.stringify(updateOptions, null, 2));
  
  request(updateOptions, function(err, res, body) {
    module.exports.validateResponse({
      err:       err,
      res:       res,
      body:      body,
      event:     obj.event,
      context:   obj.context,
      resource:  'elasticgroup',
      action:    'update',
      successCb: function(spotResponse) {
        let shouldRoll = module.exports.parseBoolean(obj.updatePolicy.shouldRoll);
        
        if(shouldRoll) {

          module.exports.rollGroup(obj);
        } else {
          let options = {
            cfn_responder: {
              returnError: false,
              logLevel:    "debug"
            }
          };
          util.done(err, obj.event, obj.context, {}, obj.refId, options);
        }
      }
    });
  });
}

/**
 * This function rolls the elastigroup. Used in update 
 *
 * @function
 * @name generateTags
 *
 * @param {Object} obj - Contains {event: event, context: context, updatePolicy: updatePolicy, refId: refId, tc: tc, body: body}
 */
module.exports.rollGroup = function(obj) {
  let rollOptions = {
    method:  'PUT',
    url:     'https://api.spotinst.io/aws/ec2/group/' + obj.refId + '/roll',
    qs:      {
      accountId: module.exports.getSpotinstAccountId(obj.event)
    },
    headers: {
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + obj.token,
      'User-Agent'   : module.exports.getUserAgent()
    },
    json:    obj.updatePolicy.rollConfig || {}
  };

  console.log(rollOptions)
  
  request(rollOptions, function(err, res, body) {
    module.exports.validateResponse({
      err:       err,
      res:       res,
      body:      body,
      event:     obj.event,
      context:   obj.context,
      resource:  'roll',
      action:    'create',
      successCb: function(spotResponse) {
        let options = {
          cfn_responder: {
            returnError: false,
            logLevel:    "debug"
          }
        };
        util.done(err, obj.event, obj.context, {}, obj.refId, options);
      }
    });
  });
};

/**
 * This function will call the asgOperation Scale Once if the asgOperation is found in the CF template, other wise a regular update will commence 
 *
 * @function
 * @name asgOperation
 *
 * @param {Object} obj - Contains {event: event, context: context, updatePolicy: updatePolicy, refId: refId, tc: tc}
 */
module.exports.asgOperation = function(obj){
  let asgValues = module.exports.getAsgOperation(obj.event)

  let asgOperationOptions = {
    method:"POST",
    url:"https://api.spotinst.io/aws/ec2/group/" + obj.refId + "/asgOperation/scaleOnce",
    qs:{
      accountId      : module.exports.getSpotinstAccountId(obj.event),
    },
    headers:{
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + obj.token,
      'User-Agent'   : module.exports.getUserAgent()
    },
    json:{
      asgOperation: {
        threshold: asgValues.elastigroupThreshold,
        asg:{
          name: module.exports.getASGName(obj.event),
          target: asgValues.asgTarget
        }
      }
    }
  }

  console.log('Asg Operation (Scale ASG): ' + JSON.stringify(asgValues, null, 2));

  request(asgOperationOptions, function(err, res, body){
    module.exports.validateResponse({
      err:       err,
      res:       res,
      body:      body,
      event:     obj.event,
      context:   obj.context,
      resource:  'asg',
      action:    'scaleOnce',
      successCb: function(spotResponse) {
        let options = {
          cfn_responder: {
            returnError: false,
            logLevel:    "debug"
          }
        }
        util.done(err, obj.event, obj.context, {}, obj.refId, options);
      }
    });
  })
}


/**
 * This function gets the tags from the CF template
 *
 * @function
 * @name generateTags
 *
 * @param {Object} groupConfig - Config from Cloudformation template
 */
module.exports.tagsExsist = function(groupConfig){
  if(_.get(groupConfig, "compute.launchSpecification.tags") == undefined){
    return false
  }else{
    return true
  }
}

/**
 * This function gets the update policy from the CF template
 *
 * @function
 * @name generateTags
 *
 * @param {Object} event - Event data from Lambda
 */
module.exports.getUpdatePolicyConfig = function(event) {
  let updatePolicy = _.get(event, 'ResourceProperties.updatePolicy') || _.get(event, 'updatePolicy');
  return updatePolicy;
}

/**
 * This function gets the asgOperation field from the CF template if it exsists
 *
 * @function
 * @name getAsgOperation
 *
 * @param {Object} event - Event data from Lambda
 *
 * @property {String} delete policy 
 */
module.exports.getAsgOperation = function(event){
  var asgOperation = _.get(event, 'ResourceProperties.asgOperation') || _.get(event, 'asgOperation');
  return asgOperation;
}


/**
 * This function gets the asg name that is input from the CF template
 *
 * @function
 * @name getASGName
 *
 * @param {Object} event - Event data from lambda
 *
 * @property {String} asg name string 
 */
module.exports.getASGName = function(event) {
  var asgName = _.get(event, 'ResourceProperties.asgName') || _.get(event, 'asgName');
  console.log('asg name is: ', asgName);
  return asgName;
};


