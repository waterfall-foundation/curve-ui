FROM node:17

RUN mkdir /app
WORKDIR /app

COPY .browserslistrc .travis.yml babel.config.js now.json package.json vue.config.js ./

RUN yarn install

COPY public ./public

ENTRYPOINT yarn run serve