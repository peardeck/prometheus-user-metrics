/* @flow */

export interface ILabel {
  name: string;
  allowedValues: string[];
}

export interface IMetric {
  name: string;
  help: string;
  labels: ILabel[];
  protocol: "statsd" | "prometheus";
}

export interface ICounterMetric extends IMetric {
  type: "counter";
}

export interface IHistogramMetricPrometheus extends IMetric {
  type: "histogram";
  buckets: number[];
  protocol: "prometheus";
}

export interface IHistogramMetricStatsd extends IMetric {
  type: "histogram";
  protocol: "statsd";
}

export type IHistogramMetric =
  | IHistogramMetricPrometheus
  | IHistogramMetricStatsd;

export type MetricConfig = ICounterMetric | IHistogramMetric;

export type MetricsConfig = MetricConfig[];

export interface ICounterEvent {
  metricType: "counter";
  metricName: string;
  labels: { [key: string]: string };
  inc: number;
}

export interface IHistogramEvent {
  metricType: "histogram";
  metricName: string;
  labels: { [key: string]: string };
  observations: number[];
}

export function getLabelPermutations(labels: ILabel[]) {
  const results: string[] = [];

  function mutate(
    remainingLabels: ILabel[],
    accumulator: { [key: string]: string }
  ) {
    if (remainingLabels.length === 0) {
      const keys = Object.keys(accumulator).sort();
      results.push(keys.map(key => `${key}="${accumulator[key]}"`).join(","));
    } else {
      const head = remainingLabels[0];
      const tail = remainingLabels.slice(1);

      head.allowedValues.forEach(allowedValue => {
        const newAccumulator = {
          ...accumulator,
          [head.name]: allowedValue
        };

        mutate(tail, newAccumulator);
      });
    }
  }

  mutate(labels, {});
  return results;
}

export function flattenLabels(labelsObject: { [key: string]: string }) {
  const keys = Object.keys(labelsObject).sort();
  const printed = keys.map(key => `${key}="${labelsObject[key]}"`);
  return printed.join(",");
}
