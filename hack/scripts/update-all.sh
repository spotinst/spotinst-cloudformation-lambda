#!/usr/bin/env bash
set -euo pipefail

# root directory of the project
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"

# name of the Lambda function
AWS_LAMBDA_FN_NAME="${AWS_LAMBDA_FN_NAME:-"spotinst-cloudformation"}"

# identifier of the function's runtime
AWS_LAMBDA_FN_RUNTIME="${AWS_LAMBDA_FN_RUNTIME:-"nodejs12.x"}"

# environment variables that are accessible from function code during execution
AWS_LAMBDA_FN_ENVIRONMENT="${AWS_LAMBDA_FN_ENVIRONMENT:-'{\"Variables\":{\"CFN_LOG_LEVEL\":\"debug\"}}'}"

function log() {
	echo "[$(date --rfc-3339=seconds)] $*"
}

function describe_regions() {
	aws ec2 describe-regions \
		--no-cli-pager \
		--profile "${AWS_PROFILE}" \
		--region "us-east-1" |
		jq -r .Regions[].RegionName
}

function lambda_exists() {
	aws lambda get-function \
		--no-cli-pager \
		--profile "${AWS_PROFILE}" \
		--function-name "${AWS_LAMBDA_FN_NAME}" \
		--region "${1}" \
		>/dev/null 2>&1
	 echo $?
}

function update_region() {
	region="$1"
	log "updating region: ${region}"

	args=()
	args+=("-r${region}")
	args+=("-p${AWS_PROFILE}")
	args+=("-f${AWS_LAMBDA_FN_ZIPFILE}")

	[[ -n "${AWS_LAMBDA_FN_NAME}" ]] &&
		args+=("-n${AWS_LAMBDA_FN_NAME}")

	[[ -n "${AWS_LAMBDA_FN_RUNTIME}" ]] &&
		args+=("-t${AWS_LAMBDA_FN_RUNTIME}")

	"${REPO_ROOT}/hack/scripts/update-region.sh" "${args[@]}"
}

function update() {
	regions="$(describe_regions)"

	for region in ${regions}; do
		# update only ap-northeast-* regions
		# [[ "${region}" != ap-northeast-* ]] && continue
		log "handling region: ${region}"
		exists="$(lambda_exists "${region}")"
		if [[ 0 -eq "${exists}" ]]; then
			update_region "${region}"
		else
			log "skipping region: ${region} (reason: lambda does not exist)"
		fi
	done
}

function validate() {
	[[ -z "${AWS_PROFILE}" ]] && usage
	[[ -z "${AWS_LAMBDA_FN_ZIPFILE}" ]] && usage

	log "AWS_PROFILE=${AWS_PROFILE}"
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
  -n    The name of the Lambda function.
  -t    The identifier of the function's runtime.
  -f    The path to the zip file you are uploading.
EOF
	exit 1
}

function main() {
	while getopts ":p:n:t:f:h:" o; do
		case "${o}" in
		p)
			AWS_PROFILE="${OPTARG}"
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
