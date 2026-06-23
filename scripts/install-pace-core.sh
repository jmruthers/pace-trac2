#!/usr/bin/env bash
set -euo pipefail

REPO="github.com/jmruthers/pace-core2.git"
TOKEN="${PACE_CORE_REPO_TOKEN:-${GITHUB_TOKEN:-${GH_TOKEN:-}}}"

resolve_core_dir() {
  if [ -f "./pace-core2/packages/core/package.json" ]; then
    printf '%s' "./pace-core2"
    return 0
  fi
  if [ -f "../pace-core2/packages/core/package.json" ]; then
    printf '%s' "../pace-core2"
    return 0
  fi
  return 1
}

init_submodule() {
  if [ -f ".gitmodules" ]; then
    echo "Initialising pace-core2 submodule..."
    if [ -n "${TOKEN}" ]; then
      git submodule sync --recursive
      git -c "url.https://x-access-token:${TOKEN}@github.com/.insteadOf=https://github.com/" \
        submodule update --init --recursive
    else
      git submodule update --init --recursive
    fi
  fi
}

ensure_core_dir() {
  if resolve_core_dir >/dev/null; then
    resolve_core_dir
    return 0
  fi

  init_submodule
  if resolve_core_dir >/dev/null; then
    resolve_core_dir
    return 0
  fi

  if [ -z "${TOKEN}" ]; then
    cat >&2 <<'EOF'
Could not find pace-core2 for the build.

Vercel (pick one):
  1. GitHub → Settings → Applications → Vercel → configure access to the pace-core2 repo, then redeploy; or
  2. Vercel project → Settings → Environment Variables → add PACE_CORE_REPO_TOKEN (GitHub PAT with repo read on pace-core2).

GitHub Actions:
  Add repository secret PACE_CORE_REPO_TOKEN with the same PAT.
EOF
    exit 1
  fi

  echo "Cloning pace-core2 into ./pace-core2..."
  git clone --depth 1 "https://x-access-token:${TOKEN}@${REPO}" "./pace-core2"
  printf '%s' "./pace-core2"
}

CORE_DIR="$(ensure_core_dir)"
echo "Using pace-core2 at ${CORE_DIR}"

echo "Building @solvera/pace-core..."
(
  cd "${CORE_DIR}"
  npm ci
  npm run build -w @solvera/pace-core
)
