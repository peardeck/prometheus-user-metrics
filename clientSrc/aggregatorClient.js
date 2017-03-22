(function () {
    function post(url, data) {
        var req = new XMLHttpRequest();
        req.open("POST", url, true);
        req.setRequestHeader('Content-type', 'application/json');

        req.onreadystatechange = function () {
            if (req.readyState === 4 && req.status == 200) {
                // :tada:
            } else {
                // if a send doesn't succeed, we lose the metrics, but we probably don't want to bother anyone w/ the details.
            }
        };

        req.send(data);
    }

    function setUpAndStartInterval({ aggregatorReportingUrl }) {
        let counterIncrements = {};
        let histogramObservations = {};

        setInterval(sendUpdates, 10000);

        function sendUpdates() {
            const body = JSON.stringify(packageUpdates());

            post(aggregatorReportingUrl, body);

            // clear all metrics. If the most recent send does not succeed, then
            // we will lose that batch of metrics. :shrug:
            counterIncrements = {};
            histogramObservations = {};
        }

        function packageUpdates() {
            const counterUpdates = Object.values(counterIncrements);
            const histogramUpdates = Object.values(histogramObservations);

            return [
                ...counterUpdates,
                ...histogramUpdates
            ];
        }

        function increment(name, labels, inc) {
            const key = `${name}{${flattenLabels(labels)}}`;
            if (counterIncrements[key]) {
                counterIncrements[key].inc += inc;
            } else {
                counterIncrements[key] = {
                    metricName: name,
                    metricType: 'counter',
                    labels,
                    inc: inc,
                };
            }
        }

        function observe(name, labels, observation) {
            const key = `${name}{${flattenLabels(labels)}}`;
            if (histogramObservations[key]) {
                histogramObservations[key].observations.push(observation);
            } else {
                histogramObservations[key] = {
                    metricName: name,
                    metricType: 'histogram',
                    labels,
                    observations: [observation]
                };
            }
        }

        function flattenLabels(labelsObject) {
            const keys = Object.keys(labelsObject).sort();
            const printed = keys.map((key) => `${key}="${labelsObject[key]}"`);
            return printed.join(',');
        }

        return function (fnName, metricName, labels, value) {
            if (fnName === 'increment') {
                increment(metricName, labels, value);
            } else if (fnName === 'observe') {
                observe(metricName, labels, value);
            } else {
                console.warn("unknown fn name ", fnName);
            }
        };
    }

    const { q, aggregatorServerRoot } = window[window['PrometheusAggregatorObjectName']];

    const actualFunction = window[window['PrometheusAggregatorObjectName']] = setUpAndStartInterval({ aggregatorReportingUrl: aggregatorServerRoot + '/record' });

    (q || []).forEach((args) => actualFunction(...args));
}());