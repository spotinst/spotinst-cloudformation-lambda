# Changelog
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [0.4.45] - 2021-04-13
### Fixed
 - Wrap roll configuration [#41](https://github.com/spotinst/spotinst-lambda/pull/41)

## [0.4.44] - 2020-12-11
### Added
 - Passthrough downstream parameters as request parameters

## [0.4.43] - 2020-07-05
### Added
 - Ignore events that contain only a credentials change (feature gated with a flag: `IgnoreCredentialsChanges`)

## [0.4.42] - 2020-06-18
### Added
 - Support OAuth 2.0 client credentials grant type

## [0.4.41] - 2019-11-21
### Added
 - Support delete amiBackup images on group delete
 - deletePolicy CFN template model updated to be same as API

## [0.4.40] - 2019-09-22
### Added
 - Support oceanEcs clusterRoll
 - Support oceanK8s clusterRoll

## [0.4.39] - 2019-08-04
### Added 
 - Support oceanEcs 
 - Support oceanEcs LaunchSpec.  

## [0.4.38] - 2019-06-30
### Added 
 - Support cluster roll for ECS groups.  

## [0.4.36] - 2019-04-07
### Added 
 - oceanLaunchSpec 

## [0.4.35] - 2019-03-19
### Fixed
 - beanstalk update supports changes to managedActions and deploymentPreferences

## [0.4.34] - 2019-02-21
### Added
  - shouldUpdateTargetCapacity to Ocean update

## [0.4.33] - 2019-01-31
### Added
 - deploymentPreferences and managedActions to Beanstalk

## [0.4.32] - 2019-01-25
### Added
 - Support for Ocean
 - New Emr Strategy support
 - retries for ocean, mrScaler, and EG create and delete

### Fixed
 - All tests to use Stubs

## [0.4.31] - 2018-12-16
### Fix
 - Rollback for creation failed by fixing spotUtils.validateResponse()

### Added
 - Ocean create, update, delete, and testing for all
 - Tests for MrScaler
 - autoTag for MrScaler

### Updated
 - MrScaler create, update and delete (had not been updated in a while)
 
## [0.4.26] - 2018-10-18
### Added
 - autoTag option to CF template
 
### Fixed
-  Race condition error with multi elastigroup create failure
 - Error in validate response util function

## [0.4.25] - 2018-09-28
### Changed
 - beanstalk and asg delete to point to elastigroup delete

## [0.4.24] - 2018-09-21
### Changed
 - moved the `createGroup` function to `spotUtil`

### Added
 - `importAsg` accepts new field `groupConfig` for create and update
 - `importBeanstalk` accepts new field `groupConfig` for create and update

## [0.4.23] - 2018-08-30
### Added
 - `importAsg` resource to create, delete and update

## [0.4.22] - 2018-06-29
### Added
- `spectrumAlert` resource to create, update and remove Spectrum Metric
  Alerts
- `spectrumAction` resource to create, update and remove Spectrum Metric
  Actions

### Changed
- updated dependencies to latest versions

### Removed
- node 4 tests - this version has been deprecated by AWS Lambda

## [0.4.0] - 2017-05-25
- `elastigroup` update - support update without changing current capacity

## [0.4.0] - 2016-10-11
### Added
- `elastigroup` update - now support updatePolicy to perform group roll.

### Changed
- `elastigroup` delete - if the group doesn't exist, mark the delete as
   successful

## [0.3.2] - 2016-09-25
### Added
- Ability to use `elastigroup` resource. This is will eventually
  replace `elasticgroup` which was a misspelling in the original version.

## [0.3.1] - 2016-08-06
### Changed
- For any `UPDATE` action initiated by CloudFormation the old config
  will be compared with the new config.  If keys have been removed they
  will be set as `null` to Spotinst. This ensures the CF and Spotinst
  declarations are exactly the same.

## [0.3.0] - 2016-04-12
### Added
- `subscription` resource - add, update and delete Spotinst Notification
  Subscriptions
- Error messages from Spotinst get passed to `Reason` and will show up
  in the CloudFormation output

### Changed
- `groupId` parameter deprecated.  An ID must be passed as `id` or
  `PhysicalResourceId`
- upgraded to lambda-formation 0.1.4

### Fixed
- elasticgroup resources now call the correct upstream lambda-formation
  handler
- The test suite was in a bad state. It has been updated for
  supscriptions, forcing the ID parameter and lambda-formation.

