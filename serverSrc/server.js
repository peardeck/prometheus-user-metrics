import express from 'express';
import bodyParser from 'body-parser';

import { makeAggregator } from './makeMetricsAggregator';
import { readMetricConfigs } from './readMetricConfigs';

readMetricConfigs().then((metricConfigs) => {
    

    const aggregator = makeAggregator(metricConfigs);
    
    // expose this publicServer to users so they can download the client & 
    // post metrics to be aggregated.
    const publicServer = express();
    publicServer.use(function (req, res, next) {
        // Enable CORS. This is necessary for demos where end-user clients
        // connect directly to this server. In production, you should
        // hide this server behind your API gateway, which should
        // strip out these headers anyway.
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    publicServer.use('/static', express.static('/stage/static'));

    publicServer.get('/status', (req, res) => {
        return res.status(200).send();
    });

    publicServer.use(bodyParser.json());
    publicServer.post('/record', (req, res, next) => {
        const batch = req.body;
        batch.forEach(aggregator.consume);

        // also count the record call!
        aggregator.consume({
            metricName: 'metrics_aggregator_record_total',
            metricType: 'counter',
            labels: [],
            inc: 1
        });
        
        res.send('OK');
    });

    publicServer.use((err, req, res, next) => {
        console.error('Got error', err);
        next(err);
    });

    publicServer.listen(3000, (err) => {
        if (err) {
            console.error("There was an error listening on 3000 for the public API");
            console.error(err);
            process.exit(1);
        } else {
            console.log("Public API listening on 3000");
        }
    })

    // expose this server to prometheus so it can scrape /metrics 
    const reportingServer = express();
    reportingServer.get('/metrics', (req, res, next) => {
        res.send(aggregator.reportMetrics());
    });

    reportingServer.listen(9102, (err) => {
        if (err) {
            console.error("There was an error listening on 9102");
            console.error(err);
            process.exit(1);
        } else {
            console.log("Aggregator listening on 9102 ");
        }
    });
})
