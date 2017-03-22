FROM node:6

RUN apt-get update && apt-get install -y libelf-dev python-all libicu-dev
RUN node --version
RUN npm --version

RUN npm install -g babel-cli 
RUN npm install -g babel-watch
RUN npm install -g babel-core 
RUN npm install -g babel-loader 
RUN npm install -g babel-register
RUN npm install -g jest

WORKDIR /stage

RUN npm install babel-plugin-syntax-async-functions 
RUN npm install babel-plugin-transform-builtin-extend 
RUN npm install babel-plugin-transform-flow-strip-types 
RUN npm install babel-plugin-transform-object-rest-spread 
RUN npm install babel-plugin-transform-regenerator 
RUN npm install babel-preset-es2015 

RUN npm install jest-cli babel-jest

COPY ./config/.babelrc /stage/.babelrc


COPY ./serverPackage.json /stage/package.json

RUN npm install

RUN mkdir /stage/static

COPY ./runDevServer.sh /stage/runDevServer.sh

# At this point /stage is set up with serverPackage.json as package.json
# and all node_modules installed. 
#
# Add your own command in docker-compose.yaml, e.g.:
#  1. mount source into /stage/src 
#  2. run `babel-watch src/server.js` or 2. run jest --watch

RUN npm install -g flow-bin@0.40.0