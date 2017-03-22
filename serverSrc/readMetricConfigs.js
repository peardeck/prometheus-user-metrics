import { configPath } from './config';
import * as fs from 'fs';
import * as path from 'path';

const builtInConfigs = [
    {
        "name": "metrics_aggregator_record_total",
        "help": "the number of times clients have posted to /record. Try rate(metrics_aggregator_record_total)*10 for a sense of how many clients are connected.",
        "type": "counter",
        "labels": [
        ]
    }
];

export function readMetricConfigs() {
    return new Promise((resolve, reject) => {

        fs.readdir(configPath, (err, fileNames) => {
            const readPromises = fileNames.map(readConfigFile);

            Promise.all(readPromises).then((configs) => {
                return [].concat.apply([], configs);
            })
                .then(resolve, reject);
        });
    })
        .then((configsReadFromFiles) => {
            return [...configsReadFromFiles, ...builtInConfigs];
        });
}

function readConfigFile(fileName) {
    return new Promise((resolve, reject) => {
        if (/.*\.json/.test(fileName)) {
            const spec = require(path.join(configPath, fileName));

            const configs = spec.allowedMetrics;

            // sort the labels in each config
            configs.forEach((config) => {
                config.labels = config.labels.sort((a, b) => a.name < b.name ? -1 : 1);
            });

            resolve(configs);
        } else {
            // not a json file, skip it
            resolve([]);
        }
    });
}