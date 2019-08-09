FROM node:12.7.0-alpine

# Setup folder
RUN mkdir -p /build/
WORKDIR /build/

# Install dependencies
COPY package.json ./package.json
COPY yarn.lock ./yarn.lock
# COPY .npmrc ./.npmrc
RUN yarn --frozen-lockfile

# Copy source files
COPY tsconfig.json ./tsconfig.json
COPY test ./test
COPY src ./src
