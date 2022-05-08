#!/bin/sh

set -e

docker build app -t jbrunton/demo-chat-app
docker push jbrunton/demo-chat-app
