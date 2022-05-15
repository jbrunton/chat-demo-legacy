#!/bin/sh

set -e

GIT_COMMIT=$(git rev-parse --short HEAD)
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
TAG="$GIT_BRANCH-$GIT_COMMIT"
DOCKER_PUSH=${DOCKER_PUSH:-false}

docker build app \
  --build-arg "GIT_BRANCH=$GIT_BRANCH" \
  --build-arg "GIT_COMMIT=$GIT_COMMIT" \
  -t jbrunton/chat-demo-app:$TAG

if [ "$DOCKER_PUSH" = true ] ; then
  docker push jbrunton/chat-demo-app:$TAG

  if [ "$GIT_BRANCH" = "develop" ] ; then
    docker tag jbrunton/chat-demo-app:$TAG jbrunton/chat-demo-app:latest
    docker push jbrunton/chat-demo-app:latest
  fi
fi
