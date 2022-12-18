FROM node:19-alpine AS builder

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci
COPY . ./

RUN NEXT_PUBLIC_DOMAIN=NEXT_PUBLIC_DOMAIN npm run build

ARG GIT_COMMIT=unknown
ARG GIT_BRANCH=unknown
LABEL git.commit $GIT_COMMIT
LABEL git.branch $GIT_BRANCH
ENV GIT_COMMIT $GIT_COMMIT
ENV GIT_BRANCH $GIT_BRANCH

ENTRYPOINT [ "./entrypoint.sh" ]
CMD ["npm", "run", "start"]
