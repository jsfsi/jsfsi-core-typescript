# Build layer
FROM node:25.6.1-alpine

RUN apk add --no-cache bash git openssh-client

RUN mkdir /workspace
WORKDIR /workspace

COPY . /workspace

RUN npm run setup

RUN npm run build

WORKDIR /workspace/packages/core-api
CMD ["sh", "-c", "npm run start:dist"]