/* @flow */

export type Label = {
    name: string,
    allowedValues: Array<string>
};

export type Metric = {
    name: string,
    help: string,
    labels: Array<Label>,
};

export type CounterMetric = Metric & {
    type: 'counter',
};

export type HistogramMetric = Metric & {
    type: 'histogram',
    buckets: Array<number>,
};

export type MetricsConfig = Array<CounterMetric | HistogramMetric>;

export type CounterEvent = {
    metricType: 'counter',
    metricName: string,
    labels: { [key: string]: string },
    inc: number
};

export type HistogramEvent = {
    metricType: 'histogram',
    metricName: string,
    labels: { [key: string]: string },
    observations: Array<number>,
};


export function getLabelPermutations(labels: Array<Label>) {
    const results = [];

    function mutate(remainingLabels, accumulator) {
        if (remainingLabels.length === 0) {
            const keys = Object.keys(accumulator).sort();
            results.push(keys.map((key) => `${key}="${accumulator[key]}"`).join(','));
        } else {
            const head = remainingLabels[0];
            const tail = remainingLabels.slice(1);

            head.allowedValues.forEach((allowedValue) => {
                const newAccumulator = {
                    ...accumulator,
                    [head.name]: allowedValue,
                };

                mutate(tail, newAccumulator);
            });
        }
    }

    mutate(labels, {});
    return results;
}

export function flattenLabels(labelsObject: {[key: string]: string}) {
    const keys = Object.keys(labelsObject).sort();
    const printed = keys.map((key) => `${key}="${labelsObject[key]}"`);
    return printed.join(',');
}