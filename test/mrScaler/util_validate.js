var assert = require('assert');
var util   = require('../../lib/resources/mrScaler/util');

const fullResult = {
  "name":        "daniel_emr_clone_manual",
  "region":      "us-west-2",
  "strategy":    {
    "cloning": {
      "originClusterId": "j-BG80HOBWYX8Q"
    }
  },
  "compute":     {
    "availabilityZones": [
      {
        "name":     "us-west-2a",
        "subnetId": "subnet-79da021e"
      },
      {
        "name":     "us-west-2b",
        "subnetId": "subnet-1ba25052"
      },
      {
        "name":     "us-west-2c",
        "subnetId": "subnet-03b7ed5b"
      }
    ],
    "instanceGroups":    {
      "masterGroup": {
        "target":        1,
        "instanceTypes": [
          "c3.xlarge"
        ],
        "lifeCycle":     "SPOT"
      },
      "coreGroup":   {
        "instanceTypes": [
          "c3.xlarge"
        ],
        "lifeCycle":     "SPOT",
        "capacity":      {
          "target":  1,
          "minimum": 0,
          "maximum": 1
        }
      },
      "taskGroup":   {
        "instanceTypes": [
          "c3.xlarge"
        ],
        "capacity":      {
          "target":  1,
          "minimum": 0,
          "maximum": 1
        },
        "lifeCycle":     "SPOT"
      }
    },
    "tags":              [
      {
        "tagKey":   "Name",
        "tagValue": "daniel_emr_manual"
      },
      {
        "tagKey":   "Creator",
        "tagValue": "Daniel"
      }
    ]
  },
  "scaling":     {
    "up": [
      {
        "policyName":        "task_policy_1",
        "metricName":        "CPUUtilization",
        "statistic":         "average",
        "unit":              "percent",
        "threshold":         50,
        "action":            {
          "type":    "updateCapacity",
          "target":  2,
          "minimum": 0,
          "maximum": 2
        },
        "namespace":         "AWS/EC2",
        "dimensions":        [
          {
            "name":  "InstanceId",
            "value": "%instance-id%"
          }
        ],
        "period":            "900",
        "evaluationPeriods": 50,
        "cooldown":          600,
        "operator":          "gte"
      }
    ]
  },
  "coreScaling": {
    "up": [
      {
        "policyName":        "Task_policy_1",
        "metricName":        "CPUUtilization",
        "statistic":         "average",
        "unit":              "percent",
        "threshold":         50,
        "action":            {
          "type":       "adjustment",
          "adjustment": 1
        },
        "namespace":         "AWS/EC2",
        "dimensions":        null,
        "period":            "300",
        "evaluationPeriods": 50,
        "cooldown":          600,
        "operator":          "gte"
      }
    ]
  }
};

describe("util castNumericStringToNumber", function() {
  
  var skeleton = util.skeleton;
  
  var config = {
    "name":        "daniel_emr_clone_manual",
    "region":      "us-west-2",
    "strategy":    {
      "cloning": {
        "originClusterId": "j-BG80HOBWYX8Q"
      }
    },
    "compute":     {
      "availabilityZones": [
        {
          "name":     "us-west-2a",
          "subnetId": "subnet-79da021e"
        },
        {
          "name":     "us-west-2b",
          "subnetId": "subnet-1ba25052"
        },
        {
          "name":     "us-west-2c",
          "subnetId": "subnet-03b7ed5b"
        }
      ],
      "instanceGroups":    {
        "masterGroup": {
          "target":        "1",
          "instanceTypes": [
            "c3.xlarge"
          ],
          "lifeCycle":     "SPOT"
        },
        "coreGroup":   {
          "instanceTypes": [
            "c3.xlarge"
          ],
          "lifeCycle":     "SPOT",
          "capacity":      {
            "target":  "1",
            "minimum": "0",
            "maximum": "1"
          }
        },
        "taskGroup":   {
          "instanceTypes": [
            "c3.xlarge"
          ],
          "capacity":      {
            "target":  "1",
            "minimum": "0",
            "maximum": "1"
          },
          "lifeCycle":     "SPOT"
        }
      },
      "tags":              [
        {
          "tagKey":   "Name",
          "tagValue": "daniel_emr_manual"
        },
        {
          "tagKey":   "Creator",
          "tagValue": "Daniel"
        }
      ]
    },
    "scaling":     {
      "up": [
        {
          "policyName":        "task_policy_1",
          "metricName":        "CPUUtilization",
          "statistic":         "average",
          "unit":              "percent",
          "threshold":         "50",
          "action":            {
            "type":    "updateCapacity",
            "target":  "2",
            "minimum": "0",
            "maximum": "2"
          },
          "namespace":         "AWS/EC2",
          "dimensions":        [
            {
              "name":  "InstanceId",
              "value": "%instance-id%"
            }
          ],
          "period":            "900",
          "evaluationPeriods": "50",
          "cooldown":          "600",
          "operator":          "gte"
        }
      ]
    },
    "coreScaling": {
      "up": [
        {
          "policyName":        "Task_policy_1",
          "metricName":        "CPUUtilization",
          "statistic":         "average",
          "unit":              "percent",
          "threshold":         "50",
          "action":            {
            "type":       "adjustment",
            "adjustment": "1"
          },
          "namespace":         "AWS/EC2",
          "dimensions":        null,
          "period":            "300",
          "evaluationPeriods": "50",
          "cooldown":          "600",
          "operator":          "gte"
        }
      ]
    }
  };
  
  it("cast full config", function() {
    util.castNumericStringToNumber(skeleton, config);
    assert.deepStrictEqual(config, fullResult);
  });
  
  it("cast number to number", function() {
    var config = {a: 1};
    util.castNumericStringToNumber({a: null}, config);
    assert.deepStrictEqual(config, {a: 1});
  });
  
  it("cast string to number", function() {
    var config = {a: "1"};
    util.castNumericStringToNumber({a: null}, config);
    assert.deepStrictEqual(config, {a: 1});
  });
  
  it("cast null to 0", function() {
    var config = {a: null};
    util.castNumericStringToNumber({a: null}, config);
    assert.deepStrictEqual(config, {a: 0});
  });
  
  it("don't cast not found", function() {
    var config = {b: "1"};
    util.castNumericStringToNumber({a: null}, config);
    assert.deepStrictEqual(config, {b: "1"});
  });
});