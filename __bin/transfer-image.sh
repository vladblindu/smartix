#!/usr/bin/env bash

# shellcheck disable=SC1090

set -euo pipefail

ENV_FILE=".env"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "❌ .env not found in current directory: $(pwd)" >&2
  exit 1
fi

echo "📄 Loading config from ${ENV_FILE}"

# Load .env into environment
set -a

source "${ENV_FILE}"
set +a

# ===== CONFIG FROM .env =====
IMAGE_NAME="${SMARTIX_IMAGE_NAME:-smartix}"
IMAGE_TAG="${SMARTIX_IMAGE_TAG:-latest}"
REMOTE_USER="${SMARTIX_REMOTE_USER:-pi}"
REMOTE_HOST="${SMARTIX_REMOTE_HOST:-192.168.1.100}"
REMOTE_TMP="${SMARTIX_REMOTE_TMP:-/tmp}"
# ============================

FULL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"
LOCAL_TAR="${IMAGE_NAME}.tar"
REMOTE_IMAGE_TAR="${REMOTE_TMP}/${IMAGE_NAME}.tar"

echo "📦 Saving Docker image: ${FULL_IMAGE}"
docker save "${FULL_IMAGE}" -o "${LOCAL_TAR}"

echo "🚚 Transferring image to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_IMAGE_TAR}"
scp "${LOCAL_TAR}" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_IMAGE_TAR}"

echo "📥 Loading image on remote host"
# shellcheck disable=SC2029
ssh "${REMOTE_USER}@${REMOTE_HOST}" "docker load -i ${REMOTE_IMAGE_TAR}"

echo "🧹 Cleaning up temporary files"
rm -f "${LOCAL_TAR}"
# shellcheck disable=SC2029
ssh "${REMOTE_USER}@${REMOTE_HOST}" "rm -f ${REMOTE_IMAGE_TAR}"

echo "✅ Image ${FULL_IMAGE} successfully transferred to ${REMOTE_HOST}"
