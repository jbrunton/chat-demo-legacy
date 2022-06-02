#!/bin/sh

set -e

GIT_COMMIT=$(git rev-parse --short HEAD)
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

docker build . \
  --build-arg "GIT_BRANCH=$GIT_BRANCH" \
  --build-arg "GIT_COMMIT=$GIT_COMMIT" \
  -t jbrunton/chat-demo-app
