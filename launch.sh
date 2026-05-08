#!/bin/sh
set -e
exec npx next start -p ${PORT:-3000} -H 0.0.0.0
