import * as bodyParser from "body-parser";
import * as express from "express";
import { StatsD } from "hot-shots";

import metricConfigs from "../config/metricConfigs";
import { makeAggregator } from "./makeMetricsAggregator";

const statsdClient = new StatsD({
  useDefaultRoute: true,
  prefix: "user_metrics.",
  errorHandler: error => {
    console.log("Statsd socket error: ", error);
  }
});

const aggregator = makeAggregator(metricConfigs, statsdClient);

// expose this publicServer to users so they can download the client &
// post metrics to be aggregated.
const publicServer = express();
publicServer.use((req, res, next) => {
  // Enable CORS. This is necessary for demos where end-user clients
  // connect directly to this server. In production, you should
  // hide this server behind your API gateway, which should
  // strip out these headers anyway.
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

publicServer.get("/status", (req, res) => {
  return res.status(200).send();
});

publicServer.use(bodyParser.json());
publicServer.post("/record", (req, res, next) => {
  const batch = req.body;
  batch.forEach(aggregator.consume);

  res.send("OK");
});

publicServer.use((err: any, req: any, res: any, next: any) => {
  console.error("Got error", err);
  next(err);
});

publicServer.listen(3000, (err: any) => {
  if (err) {
    console.error("There was an error listening on 3000 for the public API");
    console.error(err);
    process.exit(1);
  } else {
    console.log("Public API listening on 3000");
  }
});

// expose this server to prometheus so it can scrape /metrics
const reportingServer = express();
reportingServer.get("/metrics", (req, res, next) => {
  res.set("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
  res.send(aggregator.reportMetrics());
});

reportingServer.listen(9102, (err: any) => {
  if (err) {
    console.error("There was an error listening on 9102");
    console.error(err);
    process.exit(1);
  } else {
    console.log("Aggregator listening on 9102 ");
  }
});
