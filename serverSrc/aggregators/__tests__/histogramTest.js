/* @flow */
import { makeHistogram } from '../histogram';


declare type Expectable<T> = {
    toBe: (t: T) => void;
    toBeNull: () => void;
    toBeTruthy: () => void;
    toBeFalsy: () => void;
    toContain: (t: any) => void;
    toEqual: (t: T) => void;
    not: Expectable<T>;
}

declare type DoneCb = () => void;

declare function beforeAll(prepare: ((done: DoneCb) => void)): void;
declare function describe(description: string, tests: (() => void)): void;
declare function fdescribe(description: string, tests: (() => void)): void;
declare function xdescribe(description: string, tests: (() => void)): void;
declare function it(description: string, test: ((done: DoneCb) => void)): void;
declare function xit(description: string, test: ((done: DoneCb) => void)): void;
declare function fit(description: string, test: ((done: DoneCb) => void)): void;
declare function expect<T>(x: T): Expectable<T>;
declare function fail(description: string): void;


describe('Histograms', () => {
    const histogramConfig = {
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
    };

    it('has this test', () => {
        const histogram = makeHistogram(histogramConfig);

        histogram.record({
            metricType: 'histogram',
            metricName: 'firebase_response_time',
            labels: { firebaseHost: 'pd-dev-1.firebaseio.com' },
            observations: [0.1, 1, 3]
        });

        histogram.record({
            metricType: 'histogram',
            metricName: 'firebase_response_time',
            labels: { firebaseHost: 'pd-dev-1.firebaseio.com' },
            observations: [5, 9, 2]
        });

        histogram.record({
            metricType: 'histogram',
            metricName: 'firebase_response_time',
            labels: { firebaseHost: 'pd-dev-2.firebaseio.com' },
            observations: [15, 19, 12]
        });

        const expected = `# HELP firebase_response_time measures firebase response times in seconds
# TYPE firebase_response_time histogram
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="0.05"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="0.1"} 1
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="0.2"} 1
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="0.5"} 1
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="1"} 2
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="2"} 3
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="5"} 5
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="10"} 6
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="20"} 6
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="50"} 6
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="100"} 6
firebase_response_time_bucket{firebaseHost="pd-dev-1.firebaseio.com",le="+Inf"} 6
firebase_response_time_sum{firebaseHost="pd-dev-1.firebaseio.com"} 20.1
firebase_response_time_count{firebaseHost="pd-dev-1.firebaseio.com"} 6
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="0.05"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="0.1"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="0.2"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="0.5"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="1"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="2"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="5"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="10"} 0
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="20"} 3
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="50"} 3
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="100"} 3
firebase_response_time_bucket{firebaseHost="pd-dev-2.firebaseio.com",le="+Inf"} 3
firebase_response_time_sum{firebaseHost="pd-dev-2.firebaseio.com"} 46
firebase_response_time_count{firebaseHost="pd-dev-2.firebaseio.com"} 3`;

        expect(histogram.report()).toBe(expected);
    })
})