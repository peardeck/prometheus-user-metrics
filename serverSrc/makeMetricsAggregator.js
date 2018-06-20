/* @flow */
import { flattenLabels, getLabelPermutations } from './aggregators/util';
import type { MetricsConfig, CounterEvent, HistogramEvent } from './aggregators/util';

import type { Counter } from './aggregators/counter';
import { makeCounter } from './aggregators/counter';

import type { Histogram } from './aggregators/histogram';
import { makeHistogram } from './aggregators/histogram';

import type { StatsD } from 'hot-shots';

export function makeAggregator(metricsConfig: MetricsConfig, client: StatsD) {
    const counters: { [metricName: string]: Counter } = {};
    const histograms: { [metricName: string]: Histogram } = {};

    metricsConfig.forEach((config) => {
        if (config.type === 'counter') {
            counters[config.name] = makeCounter(config, client);
        } else if (config.type === 'histogram') {
            histograms[config.name] = makeHistogram(config, client);
        }
    });

    return {
        consume(payload: CounterEvent | HistogramEvent) {
            // TODO: maybe indicate success somehow? There are error codes returned that we ignore here. It would be nice to have a running metric of bad metrics that we could alarm on.
            if (payload.metricType === 'counter') {
                if (counters[payload.metricName]) {
                    // prometheus
                    counters[payload.metricName].record(payload);
                    // statsd
                    counters[payload.metricName].recordStatsd(payload);
                }
            } else if (payload.metricType === 'histogram') {
                if (histograms[payload.metricName]) {
                    // prometheuse
                    histograms[payload.metricName].record(payload);
                    // statsd
                    histograms[payload.metricName].recordStatsd(payload);
                }
            }
        },
        
        reportMetrics() {
            const counterOutput = Object.keys(counters).map((key) => counters[key].report());

            const histogramOutput = Object.keys(histograms).map((key) => histograms[key].report());

            return [
                ...counterOutput,
                ...histogramOutput,
            ].join('\n') + '\n';
        }
    }
}