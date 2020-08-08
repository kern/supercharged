#!/bin/bash

set -euo pipefail

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"
cd "$PROJECT_DIR"

if [[ "$#" -ne 1 ]] && [[ "$#" -ne 2 ]]; then
  echo "usage: $0 FUNCTION_NAME [ENV_VARS_FILE=config.yaml]"
  exit 1
fi

ENV_VARS_FILE=${2-config.yaml}

if ! which npm 2>&1 > /dev/null; then
  echo "could not find npm, please install Node v12"
  exit 1
fi

if ! which gcloud 2>&1 > /dev/null; then
  echo "could not find gcloud, please install Google Cloud Platform tools"
  exit 1
fi

if [[ ! -e "$ENV_VARS_FILE" ]]; then
  echo "could not find env vars file $ENV_VARS_FILE"
  exit 1
fi

npm install
npm run build

echo "Deploying Google Cloud Function $1..."
gcloud functions deploy $1 \
  --allow-unauthenticated \
  --trigger-http \
  --entry-point=call \
  --memory=128MB \
  --runtime=nodejs12 \
  --timeout=60s \
  --env-vars-file="$ENV_VARS_FILE"
