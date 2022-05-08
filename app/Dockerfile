FROM node:16-alpine AS builder

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci
COPY . ./

RUN NEXT_PUBLIC_DOMAIN=NEXT_PUBLIC_DOMAIN npm run build

ENTRYPOINT [ "./entrypoint.sh" ]
CMD ["npm", "run", "start"]
