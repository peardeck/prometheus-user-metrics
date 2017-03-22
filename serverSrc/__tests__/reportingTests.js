import { makeAggregator } from '../makeMetricsAggregator';

const exampleConfig = [
    {
        "name": "usage_total",
        "help": "counts of usage, like times a feature has been used, etc",
        "type": "counter",
        "labels": [
            {
                "name": "browser",
                "allowedValues": [
                    "chrome",
                    "firefox",
                    "safari",
                    "edge"
                ]
            },
            {
                "name": "feature",
                "allowedValues": [
                    "quickQuestion",
                    "selfPacedMode",
                    "blockStudent",
                    "showContent"
                ]
            }
        ]
    },
    {
        "name": "firebase_response_time",
        "help": "measures firebase response times in seconds",
        "type": "histogram",
        "labels": [
            {
                "name": "firebaseHost",
                "allowedValues": [
                    "pd-dev-1.firebaseio.com",
                    "pd-dev-2.firebaseio.com"
                ]
            }
        ],
        "buckets": [
            0.05,
            0.1,
            0.2,
            0.5,
            1,
            2,
            5,
            10,
            20,
            50,
            100
        ]
    }
];

function outputWithUsageTotal(usageTotal) {
    return `# HELP usage_total counts of usage, like times a feature has been used, etc
# TYPE usage_total counter
usage_total{browser="chrome",feature="quickQuestion"} ${usageTotal}
usage_total{browser="chrome",feature="selfPacedMode"} 0
usage_total{browser="chrome",feature="blockStudent"} 0
usage_total{browser="chrome",feature="showContent"} 0
usage_total{browser="firefox",feature="quickQuestion"} 0
usage_total{browser="firefox",feature="selfPacedMode"} 0
usage_total{browser="firefox",feature="blockStudent"} 0
usage_total{browser="firefox",feature="showContent"} 0
usage_total{browser="safari",feature="quickQuestion"} 0
usage_total{browser="safari",feature="selfPacedMode"} 0
usage_total{browser="safari",feature="blockStudent"} 0
usage_total{browser="safari",feature="showContent"} 0
usage_total{browser="edge",feature="quickQuestion"} 0
usage_total{browser="edge",feature="selfPacedMode"} 0
usage_total{browser="edge",feature="blockStudent"} 0
usage_total{browser="edge",feature="showContent"} 0
# HELP firebase_response_time measures firebase response times in seconds
# TYPE firebase_response_time histogram
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="0.05"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="0.1"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="0.2"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="0.5"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="1"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="2"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="5"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="10"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="20"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="50"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="100"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="+Inf"} 0
firebase_response_time_sum{firebaseHost="pd-dev-1.firebaseio.com"} 0
firebase_response_time_count{firebaseHost="pd-dev-1.firebaseio.com"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="0.05"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="0.1"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="0.2"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="0.5"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="1"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="2"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="5"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="10"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="20"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="50"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="100"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="+Inf"} 0
firebase_response_time_sum{firebaseHost="pd-dev-2.firebaseio.com"} 0
firebase_response_time_count{firebaseHost="pd-dev-2.firebaseio.com"} 0
`;
}

const usageTotalKey = 'usage_total{browser="chrome",feature="quickQuestion"}';

describe('Aggregator reporting', () => {
    it('prints a correct default', () => {
        const aggregator = makeAggregator(exampleConfig);
        expect(aggregator.reportMetrics()).toBe(outputWithUsageTotal(0));
    });

    it('correctly increments uninitialized counters', () => {
        const aggregator = makeAggregator(exampleConfig);
        aggregator.consume({
            metricName: 'usage_total',
            metricType: 'counter',
            labels: {
                browser: 'chrome',
                feature: 'quickQuestion',
            },
            inc: 3.5
        });

        expect(aggregator.reportMetrics()).toBe(outputWithUsageTotal(3.5));
    });

    it('correctly increments initialized counters', () => {
        const aggregator = makeAggregator(exampleConfig);
        aggregator.consume({
            metricName: 'usage_total',
            metricType: 'counter',
            labels: {
                browser: 'chrome',
                feature: 'quickQuestion',
            },
            inc: 3.5
        });
        aggregator.consume({
            metricName: 'usage_total',
            metricType: 'counter',
            labels: {
                browser: 'chrome',
                feature: 'quickQuestion',
            },
            inc: 3.5
        });
        expect(aggregator.reportMetrics()).toBe(outputWithUsageTotal(7));
    });

    it('correctly records observations of histograms', () => {
        const aggregator = makeAggregator(exampleConfig);

        const expected = `# HELP usage_total counts of usage, like times a feature has been used, etc
# TYPE usage_total counter
usage_total{browser="chrome",feature="quickQuestion"} 0
usage_total{browser="chrome",feature="selfPacedMode"} 0
usage_total{browser="chrome",feature="blockStudent"} 0
usage_total{browser="chrome",feature="showContent"} 0
usage_total{browser="firefox",feature="quickQuestion"} 0
usage_total{browser="firefox",feature="selfPacedMode"} 0
usage_total{browser="firefox",feature="blockStudent"} 0
usage_total{browser="firefox",feature="showContent"} 0
usage_total{browser="safari",feature="quickQuestion"} 0
usage_total{browser="safari",feature="selfPacedMode"} 0
usage_total{browser="safari",feature="blockStudent"} 0
usage_total{browser="safari",feature="showContent"} 0
usage_total{browser="edge",feature="quickQuestion"} 0
usage_total{browser="edge",feature="selfPacedMode"} 0
usage_total{browser="edge",feature="blockStudent"} 0
usage_total{browser="edge",feature="showContent"} 0
# HELP firebase_response_time measures firebase response times in seconds
# TYPE firebase_response_time histogram
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="0.05"} 1
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="0.1"} 2
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="0.2"} 2
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="0.5"} 3
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="1"} 3
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="2"} 3
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="5"} 3
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="10"} 3
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="20"} 3
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="50"} 3
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="100"} 3
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="+Inf"} 3
firebase_response_time_sum{firebaseHost="pd-dev-1.firebaseio.com"} 0.45
firebase_response_time_count{firebaseHost="pd-dev-1.firebaseio.com"} 3
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="0.05"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="0.1"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="0.2"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="0.5"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="1"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="2"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="5"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="10"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="20"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="50"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="100"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="+Inf"} 0
firebase_response_time_sum{firebaseHost="pd-dev-2.firebaseio.com"} 0
firebase_response_time_count{firebaseHost="pd-dev-2.firebaseio.com"} 0
`;

        aggregator.consume({
            metricName: 'firebase_response_time',
            metricType: 'histogram',
            labels: {
                firebaseHost: 'pd-dev-1.firebaseio.com',
            },
            observations: [0.1, 0.3, 0.05]
        });

        expect(aggregator.reportMetrics()).toBe(expected);
    })
});