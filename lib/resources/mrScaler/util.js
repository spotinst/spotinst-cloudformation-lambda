module.exports.skeleton = {
  compute:     {
    instanceGroups: {
      coreGroup:   {
        target:   null,
        capacity: {
          maximum: null,
          minimum: null,
          target:  null
        }
      },
      masterGroup: {
        target: null
      },
      taskGroup:   {
        capacity: {
          maximum: null,
          minimum: null,
          target:  null
        }
      }
    }
  },
  scaling:     {
    up:   [
      {
        threshold:         null,
        minTargetCapacity: null,
        evaluationPeriods: null,
        cooldown:          null,
        action:            {
          adjustment: null,
          maximum:    null,
          minimum:    null,
          target:     null
        }
      }
    ],
    down: [
      {
        threshold:         null,
        maxTargetCapacity: null,
        evaluationPeriods: null,
        cooldown:          null,
        action:            {
          adjustment: null,
          maximum:    null,
          minimum:    null,
          target:     null
        }
      }
    ]
  },
  coreScaling: {
    up:   [
      {
        threshold:         null,
        minTargetCapacity: null,
        evaluationPeriods: null,
        cooldown:          null,
        action:            {
          adjustment: null,
          maximum:    null,
          minimum:    null,
          target:     null
        }
      }
    ],
    down: [
      {
        threshold:         null,
        maxTargetCapacity: null,
        evaluationPeriods: null,
        cooldown:          null,
        action:            {
          adjustment: null,
          maximum:    null,
          minimum:    null,
          target:     null
        }
      }
    ]
  },
  strategy:    {
    cloning: {
      numberOfRetries: null
    }
  }
};

var _validate = module.exports.castNumericStringToNumber = function(skeleton, config) {
  for(var key in skeleton) {
    var skeletonHasProperty = skeleton.hasOwnProperty(key);
    if(skeletonHasProperty === false) {
      continue; //skip this property
    }
    var configHasProperty = config.hasOwnProperty(key);
    if(configHasProperty === false) {
      continue; //no need to dig deeper
    }
    if(skeleton[key] === null) {
      config[key] = Number(config[key])
    } else {
      _validate(skeleton[key], config[key]);
    }
  }
};

