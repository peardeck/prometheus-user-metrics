FROM node:6

RUN apt-get update && apt-get install -y libelf-dev python-all libicu-dev
RUN node --version
RUN npm --version

RUN npm install -g babel-cli 
RUN npm install -g babel-watch
RUN npm install -g babel-core 
RUN npm install -g babel-loader 
RUN npm install -g babel-register

WORKDIR /stage

RUN npm install babel-plugin-syntax-async-functions 
RUN npm install babel-plugin-transform-builtin-extend 
RUN npm install babel-plugin-transform-flow-strip-types 
RUN npm install babel-plugin-transform-object-rest-spread 
RUN npm install babel-plugin-transform-regenerator 
RUN npm install babel-preset-es2015 

COPY ./config/.babelrc /stage/.babelrc


COPY ./serverPackage.json /stage/package.json

RUN npm install

RUN mkdir /stage/static
RUN mkdir /stage/built

# Build the server and put it in /stage/built
COPY ./serverSrc /stage/serverSrc
RUN babel --out-dir /stage/built /stage/serverSrc

# Build the client lib and put it in /stage/static
COPY ./clientSrc /stage/clientSrc
RUN babel --out-file /stage/static/aggregatorClient.js /stage/clientSrc/aggregatorClient.js

WORKDIR /stage/built
CMD ["node", "server.js"]