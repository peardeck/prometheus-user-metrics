/* @flow */
import {
  flattenLabels,
  getLabelPermutations,
  ICounterEvent,
  IDistributionEvent,
  IHistogramEvent,
  MetricsConfig
} from "./aggregators/util";

import { ICounter, makeCounter } from "./aggregators/counter";
import { IHistogram, makeHistogram } from "./aggregators/histogram";
import { IDistribution, makeDistribution } from "./aggregators/distribution";

import { StatsD } from "hot-shots";

export function makeAggregator(metricsConfig: MetricsConfig, client: StatsD) {
  const counters: { [metricName: string]: ICounter } = {};
  const histograms: { [metricName: string]: IHistogram } = {};
  const distributions: { [metricName: string]: IDistribution } = {};

  metricsConfig.forEach(config => {
    if (config.type === "counter") {
      counters[config.name] = makeCounter(config, client);
    } else if (config.type === "histogram") {
      histograms[config.name] = makeHistogram(config, client);
    } else if (config.type === "distribution") {
      distributions[config.name] = makeDistribution(config, client);
    }
  });

  return {
    consume(payload: ICounterEvent | IHistogramEvent | IDistributionEvent) {
      // TODO: maybe indicate success somehow? There are error codes returned that we ignore here. It would be nice to have a running metric of bad metrics that we could alarm on.
      if (payload.metricType === "counter") {
        if (counters[payload.metricName]) {
          counters[payload.metricName].record(payload);
        }
      } else if (payload.metricType === "histogram") {
        if (histograms[payload.metricName]) {
          histograms[payload.metricName].record(payload);
        }
      } else if (payload.metricType === 'distribution') {
        if (distributions[payload.metricName]) {
          distributions[payload.metricName].record(payload);
        }
      }
    },

    reportMetrics() {
      const counterOutput = Object.keys(counters).map(key =>
        counters[key].report()
      );

      const histogramOutput = Object.keys(histograms).map(key =>
        histograms[key].report()
      );

      return [...counterOutput, ...histogramOutput].join("\n") + "\n";
    }
  };
}
