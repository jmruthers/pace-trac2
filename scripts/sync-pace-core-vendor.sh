#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CORE_DIR="${PACE_CORE_DIR:-${ROOT}/../pace-core2/packages/core}"
VENDOR_DIR="${ROOT}/vendor"

if [ ! -f "${CORE_DIR}/package.json" ]; then
  echo "pace-core source not found at ${CORE_DIR}" >&2
  echo "Set PACE_CORE_DIR or clone pace-core2 beside pace-trac." >&2
  exit 1
fi

mkdir -p "${VENDOR_DIR}"
(
  cd "${CORE_DIR}"
  npm run build
  npm pack --pack-destination "${VENDOR_DIR}"
)

PACK="$(ls -t "${VENDOR_DIR}"/solvera-pace-core-*.tgz | head -1)"
echo "Packed ${PACK}"
echo "Update package.json dependency to file:./vendor/$(basename "${PACK}") if the version changed."
