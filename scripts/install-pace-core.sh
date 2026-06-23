#!/usr/bin/env bash
set -euo pipefail

CORE_DIR="../pace-core2"
REPO="github.com/jmruthers/pace-core2.git"
TOKEN="${PACE_CORE_REPO_TOKEN:-${GITHUB_TOKEN:-${GH_TOKEN:-}}}"

if [ -f "${CORE_DIR}/packages/core/package.json" ]; then
  echo "pace-core2 already present at ${CORE_DIR}"
elif [ -n "${TOKEN}" ]; then
  echo "Cloning pace-core2 into ${CORE_DIR}..."
  rm -rf "${CORE_DIR}"
  git clone --depth 1 "https://x-access-token:${TOKEN}@${REPO}" "${CORE_DIR}"
else
  cat >&2 <<'EOF'
Could not find pace-core2 and no GitHub token was provided.

Vercel: Project → Settings → Environment Variables → add
  PACE_CORE_REPO_TOKEN = GitHub PAT with read access to jmruthers/pace-core2
Enable it for Production, Preview, and Development, then redeploy.

GitHub Actions: add the same value as repository secret PACE_CORE_REPO_TOKEN.

Local dev: keep pace-core2 as a sibling folder at ../pace-core2 (normal Solvera layout).
EOF
  exit 1
fi

echo "Building @solvera/pace-core..."
(
  cd "${CORE_DIR}"
  npm ci
  npm run build -w @solvera/pace-core
)
