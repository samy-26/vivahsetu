#!/bin/bash
# Run Next.js frontend from root (packages are hoisted to root node_modules)
cd "$(dirname "$0")/apps/frontend"
export PATH="$(pwd)/../../node_modules/.bin:$PATH"
next dev -p 3000
