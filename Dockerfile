FROM node:8.9.3

# aws env
RUN curl -o /tmp/aws-env-linux-amd64 -L https://github.com/datacamp/aws-env/releases/download/v0.1-session-fix/aws-env-linux-amd64 && \
  chmod +x /tmp/aws-env-linux-amd64 && \
  mv /tmp/aws-env-linux-amd64 /bin/aws-env

EXPOSE 9102

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

# Cache the installation of the npm packages
COPY package-lock.json .
COPY package.json .

RUN npm install

COPY . .

RUN npm run build:prod

USER node

CMD ["bash", "-c", "eval $(aws-env) && npm start"]