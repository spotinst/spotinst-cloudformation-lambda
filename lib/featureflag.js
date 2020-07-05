/**
 * All registered feature flags.
 */
const featureFlags = {};

/**
 * FeatureFlag indicates whether a given feature is enabled or not.
 */
class FeatureFlag {
  constructor(name, enabled = false) {
    this._name    = name;
    this._enabled = enabled;
  }

  /**
   * Name returns the name of the feature flag.
   * @returns {*}
   */
  name = () => this._name;

  /**
   * Enabled returns true if the feature is enabled.
   * @returns {*}
   */
  enabled = () => this._enabled;

  /**
   * toString returns the string representation of the feature flag.
   * @returns {string}
   */
  toString = () => `${this._name}=${this._enabled}`;
}

/**
 * Set parses and stores features from a string like "feature1=true,feature2=false".
 */
module.exports.set = (features = "") => {
  features.trim().split(",").forEach((kv) => {
    let segments = kv.split("=", 2);
    let name     = segments[0].trim();

    let enabled = true;
    if (segments.length > 1) {
      enabled = parseBool(segments[1].trim());
    }

    featureFlags[name] = new FeatureFlag(name, enabled);
  });
};

/**
 * Get returns a specific feature flag by name.
 * @param name
 * @returns {FeatureFlag}
 */
module.exports.get = (name) => featureFlags[name] || new FeatureFlag(name);

/**
 * All returns a list of all known feature flags.
 * @returns {[FeatureFlag]}
 */
module.exports.all = () => Object.values(featureFlags);


/**
 * ParseBool returns the boolean value represented by the string.
 * @param str
 * @returns {boolean}
 */
const parseBool = (str) => (str && ["1", "t", "true"].includes(str.toLowerCase()));
