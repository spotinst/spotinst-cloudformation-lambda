#!/usr/bin/env bash
set -e

# root directory of the project
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"

# name of the Lambda function
AWS_LAMBDA_FN_NAME="${AWS_LAMBDA_FN_NAME:-"spotinst-cloudformation"}"

# identifier of the function's runtime
AWS_LAMBDA_FN_RUNTIME="${AWS_LAMBDA_FN_RUNTIME:-"nodejs12.x"}"

function log() {
	echo "[$(date --rfc-3339=seconds)] $*"
}

function update_function_config() {
	log "updating function configuration"

	aws lambda update-function-configuration \
		--profile "${AWS_PROFILE}" \
		--region "${AWS_REGION}" \
		--function-name "${AWS_LAMBDA_FN_NAME}" \
		--runtime "${AWS_LAMBDA_FN_RUNTIME}"
}

function update_function_code() {
	log "updating function code"

	aws lambda update-function-code \
		--profile "${AWS_PROFILE}" \
		--region "${AWS_REGION}" \
		--function-name "${AWS_LAMBDA_FN_NAME}" \
		--zip-file "fileb://${AWS_LAMBDA_FN_ZIPFILE}"
}

function update_version() {
	VERSION="$(awk '/version/ { print $2 }' "${REPO_ROOT}/package.json" | xargs | tr -d ,)"
	log "updating version"

	aws lambda publish-version \
		--profile "${AWS_PROFILE}" \
		--region "${AWS_REGION}" \
		--function-name "${AWS_LAMBDA_FN_NAME}" \
		--description "${VERSION}"
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
	log "AWS_LAMBDA_FN_ZIPFILE=${AWS_LAMBDA_FN_ZIPFILE}"
}

function usage() {
	cat <<EOF
USAGE:
	$ $(basename "$0") [<flags>]

FLAGS:
	-p    Use a specific profile from your credential file.
	-r    The region to use. Overrides config/env settings.
	-n    The name of the Lambda function.
	-t    The identifier of the function's runtime.
	-f    The path to the zip file you are uploading.
EOF
	exit 1
}

function main() {
	while getopts ":p:r:n:t:f:h:" o; do
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
