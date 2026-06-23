#!/usr/bin/env bash
set -euo pipefail

CORE_DIR="../pace-core2"
REPO="github.com/jmruthers/pace-core2.git"
TOKEN="${PACE_CORE_REPO_TOKEN:-${GITHUB_TOKEN:-}}"

if [ -f "${CORE_DIR}/packages/core/package.json" ]; then
  echo "pace-core2 already present at ${CORE_DIR}"
else
  if [ -z "${TOKEN}" ]; then
    echo "Missing PACE_CORE_REPO_TOKEN (or GITHUB_TOKEN) — required to clone private pace-core2." >&2
    exit 1
  fi
  echo "Cloning pace-core2 into ${CORE_DIR}..."
  git clone --depth 1 "https://x-access-token:${TOKEN}@${REPO}" "${CORE_DIR}"
fi

echo "Building @solvera/pace-core..."
(
  cd "${CORE_DIR}"
  npm ci
  npm run build -w @solvera/pace-core
)
