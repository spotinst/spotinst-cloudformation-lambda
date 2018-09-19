# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [UNRELEASED]
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

