#!/bin/bash
# Run NestJS backend from root (packages are hoisted to root node_modules)
cd "$(dirname "$0")/apps/backend"
export PATH="$(pwd)/../../node_modules/.bin:$PATH"
export NODE_PATH="$(pwd)/../../node_modules"
nest start --watch
