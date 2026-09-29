#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/11_PRODUCTION/web"
if [ ! -d node_modules ]; then npm install; fi
npm run dev
