#!/bin/sh

set -e

GIT_COMMIT=$(git rev-parse --short HEAD)
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
STACK_NAME=${STACK_NAME?}

cd pulumi

pulumi stack select $STACK_NAME
pulumi up -y
