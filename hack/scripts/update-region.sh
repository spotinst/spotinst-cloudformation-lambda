#!/usr/bin/env bash
set -euo pipefail

# root directory of the project
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"

# name of the Lambda function
AWS_LAMBDA_FN_NAME="${AWS_LAMBDA_FN_NAME:-"spotinst-cloudformation"}"

# identifier of the function's runtime
AWS_LAMBDA_FN_RUNTIME="${AWS_LAMBDA_FN_RUNTIME:-"nodejs12.x"}"

# environment variables that are accessible from function code during execution
AWS_LAMBDA_FN_ENVIRONMENT="${AWS_LAMBDA_FN_ENVIRONMENT:-"{\"Variables\":{\"CFN_LOG_LEVEL\":\"debug\"}}"}"

function log() {
	echo "[$(date --rfc-3339=seconds)] $*"
}

function execute() {
	cmd="$1"
	log "executing: ${cmd}"
	${cmd}
}

function update_function_config() {
	log "updating function configuration"

	args=()
	args+=("--no-cli-pager")
	args+=("--profile=${AWS_PROFILE}")
	args+=("--region=${AWS_REGION}")
	args+=("--function-name=${AWS_LAMBDA_FN_NAME}")

	[[ -n "${AWS_LAMBDA_FN_RUNTIME}" ]] &&
		args+=("--runtime=${AWS_LAMBDA_FN_RUNTIME}")

	[[ -n "${AWS_LAMBDA_FN_ENVIRONMENT}" ]] &&
		args+=("--environment=${AWS_LAMBDA_FN_ENVIRONMENT}")

	execute "aws lambda update-function-configuration ${args[*]}"
}

function update_function_code() {
	log "updating function code"

	args=()
	args+=("--no-cli-pager")
	args+=("--profile=${AWS_PROFILE}")
	args+=("--region=${AWS_REGION}")
	args+=("--function-name=${AWS_LAMBDA_FN_NAME}")
	args+=("--zip-file=fileb://${AWS_LAMBDA_FN_ZIPFILE}")
	args+=("--cli-connect-timeout=6000")

	execute "aws lambda update-function-code ${args[*]}"
}

function update_version() {
	VERSION="$(awk '/version/ { print $2 }' "${REPO_ROOT}/package.json" | xargs | tr -d ,)"
	log "updating version"

	args=()
	args+=("--no-cli-pager")
	args+=("--profile=${AWS_PROFILE}")
	args+=("--region=${AWS_REGION}")
	args+=("--function-name=${AWS_LAMBDA_FN_NAME}")
	args+=("--description=${VERSION}")

	execute "aws lambda publish-version ${args[*]}"
}

function update() {
	update_function_config
	update_function_code
	update_version
}

function validate() {
	[[ -z "${AWS_PROFILE}" ]] && usage
	[[ -z "${AWS_REGION}" ]] && usage
	[[ -z "${AWS_LAMBDA_FN_ZIPFILE}" ]] && usage

	log "AWS_PROFILE=${AWS_PROFILE}"
	log "AWS_REGION=${AWS_REGION}"
	log "AWS_LAMBDA_FN_NAME=${AWS_LAMBDA_FN_NAME}"
	log "AWS_LAMBDA_FN_RUNTIME=${AWS_LAMBDA_FN_RUNTIME}"
	log "AWS_LAMBDA_FN_ENVIRONMENT=${AWS_LAMBDA_FN_ENVIRONMENT}"
	log "AWS_LAMBDA_FN_ZIPFILE=${AWS_LAMBDA_FN_ZIPFILE}"
}

function usage() {
	cat <<EOF
USAGE:
	$ $(basename "$0") [<flags>]

FLAGS:
	-p    Use a specific profile from your credential file.
	-r    Region to use. Overrides config/env settings.
	-n    Name of the Lambda function.
	-t    Identifier of the function's runtime.
	-e    Environment variables that are accessible from function code during execution.
	-f    Path to the zip file you are uploading.
EOF
	exit 1
}

function main() {
	while getopts ":p:r:n:t:e:f:h:" o; do
		case "${o}" in
		p)
			AWS_PROFILE="${OPTARG}"
			;;
		r)
			AWS_REGION="${OPTARG}"
			;;
		n)
			AWS_LAMBDA_FN_NAME="${OPTARG}"
			;;
		t)
			AWS_LAMBDA_FN_RUNTIME="${OPTARG}"
			;;
		e)
			AWS_LAMBDA_FN_ENVIRONMENT="${OPTARG}"
			;;
		f)
			AWS_LAMBDA_FN_ZIPFILE="${OPTARG}"
			;;
		h)
			usage
			exit
			;;
		*)
			usage
			;;
		esac
	done
	shift $((OPTIND - 1))

	validate
	update
}

main "$@"
