#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -f .env.push.local ]]; then
  # shellcheck disable=SC1091
  set -a
  source ".env.push.local"
  set +a
fi

if [[ -n "${GITHUB_PUSH_TOKEN:-}" ]]; then
  git push "https://oauth2:${GITHUB_PUSH_TOKEN}@github.com/Barsellino/fest-files.git" HEAD:main
  exit 0
fi

exec git push -u origin main
