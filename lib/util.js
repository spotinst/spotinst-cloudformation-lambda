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
  
  console.log('Spotinst response: ' + JSON.stringify(body, null, 2));
  
  if(res.hasOwnProperty('statusCode') && res.statusCode > 201) {
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
      spotResponse.failureCb(spotResponse);
    }
    else {
      return util.done(spotResponse.resource + " " + spotResponse.action + " failed: " + errMsg, event, context);
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
  var accountId = _.get(event, 'ResourceProperties.accountId') || _.get(event, 'accountId');
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
        util.done(err, event, context, {}, groupId, options);
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







