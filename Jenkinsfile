@Library('utils') _
import com.spotinst.GlobalVars

def nodeVersion   = '22'
def pod = renderPod(
    argocdcli:      false,
    kaniko:         false,
    yq:             false,
    serviceAccount: 'terraform',
    nodejs:         true,
    nodejsVersion:  nodeVersion
)

def svcName       = 'spotinst-cloudformation-gidi'
def defaultBranch = 'master'
def roleName      = 'Spotinst-Lambda-Execution-Role'

// these will be concatenated as flags to the aws lambda create-function command
def lambdaConfig  = [
    "timeout": "900"
]

def regions = [
    'af-south-1',
    'ap-east-1',
    'ap-northeast-1',
    'ap-northeast-2',
    'ap-northeast-3',
    'ap-south-1',
    'ap-south-2',
    'ap-southeast-1',
    'ap-southeast-2',
    'ap-southeast-3',
    'ca-central-1',
    'ca-west-1',
    'eu-central-1',
    'eu-central-2',
    'eu-north-1',
    'eu-south-1',
    'eu-south-2',
    'eu-west-1',
    'eu-west-2',
    'eu-west-3',
    'il-central-1',
    'me-central-1',
    'me-south-1',
    'sa-east-1',
    'us-east-1',
    'us-east-2',
    'us-west-1',
    'us-west-2'
]

nodejsLambdaPipeline(
    svcName:       svcName,
    podDefinition: pod,
    defaultBranch: defaultBranch,
    nodeVersion:   nodeVersion,
    regions:       regions,
    roleName:      roleName,
    lambdaConfig:  lambdaConfig
)
