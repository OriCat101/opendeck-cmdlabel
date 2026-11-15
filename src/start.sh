#!/bin/sh
exec "${NODE_BIN:-node}" "$(dirname -- "$0")/plugin.mjs" "$@"
