FROM node:6

# aws env
RUN curl -o /tmp/aws-env-linux-amd64 -L https://github.com/datacamp/aws-env/releases/download/v0.1-session-fix/aws-env-linux-amd64 && \
  chmod +x /tmp/aws-env-linux-amd64 && \
  mv /tmp/aws-env-linux-amd64 /bin/aws-env

RUN apt-get update && apt-get install -y libelf-dev python-all libicu-dev
RUN node --version
RUN npm --version

RUN npm install -g babel-cli 
RUN npm install -g babel-watch
RUN npm install -g babel-core 
RUN npm install -g babel-loader 
RUN npm install -g babel-register

WORKDIR /stage

EXPOSE 9102

LABEL "com.datadoghq.ad.check_names"='["prometheus"]'
LABEL "com.datadoghq.ad.init_configs"='[{}]'
LABEL "com.datadoghq.ad.instances"='[{"prometheus_url": "http://%%host%%:9102/metrics", "namespace": "user_metrics", "metrics": ["*"]}]'
LABEL "com.datadoghq.ad.logs"='[{}]'

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
RUN mkdir /stage/metricConfigs

# Build the server and put it in /stage/built
COPY ./serverSrc /stage/serverSrc
RUN babel --out-dir /stage/built /stage/serverSrc

# Build the client lib and put it in /stage/static
COPY ./clientSrc /stage/clientSrc
RUN babel --out-file /stage/static/aggregatorClient.js /stage/clientSrc/aggregatorClient.js

COPY ./config/metricConfigs /stage/metricConfigs

WORKDIR /stage/built
CMD ["bash", "-c", "eval $(aws-env) && node server.js"]