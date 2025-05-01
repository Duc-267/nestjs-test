
ARG NODE_VERSION=20.14.0

# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine as base

# Set working directory for all build stages.
WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm install

EXPOSE 3001

CMD [ "npm", "start" ]