#!/bin/bash

babel clientSrc/aggregatorClient.js --watch --out-file static/aggregatorClient.js &
babel-watch serverSrc/server.js