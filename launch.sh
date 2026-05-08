#!/bin/sh
set -e
corepack enable >/dev/null 2>&1 || true
exec pnpm exec next start -p ${PORT:-3000} -H 0.0.0.0
