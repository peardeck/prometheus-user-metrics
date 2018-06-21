/* @flow */

import { StatsD } from "hot-shots";

import {
  flattenLabels,
  getLabelPermutations,
  ICounterEvent,
  ICounterMetric
} from "./util";

export interface ICounter {
  record: (event: ICounterEvent) => void;
  report: () => string;
}

export function makeCounter(
  config: ICounterMetric,
  statsdClient: StatsD
): ICounter {
  const { name, help, type, protocol } = config;
  const client = statsdClient;

  const allowedLabelPermutations = getLabelPermutations(config.labels);
  const counterValues: { [key: string]: number } = {};
  allowedLabelPermutations.forEach(permutation => {
    // initialize all allowed permutations to zero.
    counterValues[permutation] = 0;

    // later, all other permutations will be rejected, so this
    // secures the counters against misbehaving clients who would
    // send unknown labels or values and crash poor prometheus.
  });

  const recordPrometheus = (event: ICounterEvent) => {
    const labelPermutationKey = flattenLabels(event.labels);
    if (typeof counterValues[labelPermutationKey] === "number") {
      counterValues[labelPermutationKey] += event.inc;
    } else {
      console.log(`Disallowed label permutation ${labelPermutationKey}`);
    }
  };

  const recordStatsd = (event: ICounterEvent) => {
    console.log("increment", event);
    client.increment(name, event.inc, event.labels);
  };

  return {
    record(event: ICounterEvent) {
      if (protocol === "statsd") {
        recordStatsd(event);
      } else if (protocol === "prometheus") {
        recordPrometheus(event);
      } else {
        console.log(`Unknown protocol: ${protocol}`);
      }
    },

    report() {
      const headerLines = [`# HELP ${name} ${help}`, `# TYPE ${name} ${type}`];

      const bodyLines = Object.keys(counterValues).map(labelPermutationKey => {
        const value = counterValues[labelPermutationKey];
        return `${name}{${labelPermutationKey}} ${value}`;
      });

      return headerLines.join("\n") + "\n" + bodyLines.join("\n");
    }
  };
}
