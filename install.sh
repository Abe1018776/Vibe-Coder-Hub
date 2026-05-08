#!/bin/sh
set -e
export NODE_OPTIONS="--max-old-space-size=180"
npm install --legacy-peer-deps --no-audit --no-fund --jobs=1
npm run build
npm prune --omit=dev
