#!/bin/sh

set -e

echo "config: replacing NEXT_PUBLIC_DOMAIN with $NEXT_PUBLIC_DOMAIN"
find /usr/src/app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#NEXT_PUBLIC_DOMAIN#$NEXT_PUBLIC_DOMAIN#g"

exec "$@"
