import { StatsD } from "hot-shots";

import {
  flattenLabels,
  getLabelPermutations,
  IHistogramEvent,
  IHistogramMetric,
  IHistogramMetricPrometheus,
  IHistogramMetricStatsd,
  ILabel
} from "./util";

interface IHistogramObservationAggregate {
  buckets: { [bucketLimit: string]: number }; // Note, "+Inf" won't be kept in here. We'll just report `sum` as +Inf synthetically when printing this aggregate.
  sum: number;
  count: number;
}

function addObservation(
  aggregate: IHistogramObservationAggregate,
  newObservation: number
) {
  Object.keys(aggregate.buckets).forEach(bucketLimit => {
    if (newObservation <= Number(bucketLimit)) {
      aggregate.buckets[bucketLimit] += 1;
    }
  });

  aggregate.count += 1;
  aggregate.sum += newObservation;
}

function printObservationAggregate(
  metricName: string,
  labelPermutationKey: string,
  aggregate: IHistogramObservationAggregate
) {
  const leKeys = Object.keys(aggregate.buckets).sort(
    (a, b) => (Number(a) < Number(b) ? -1 : 1)
  );
  const labelStringPrefix =
    labelPermutationKey.length > 0
      ? `${labelPermutationKey},` // stick labels in front of new `le` label with a comma
      : ""; // no labels, no comma.

  const bucketLines = leKeys.map(bucketLimit => {
    return `${metricName}_bucket{${labelStringPrefix}le="${bucketLimit}"} ${
      aggregate.buckets[bucketLimit]
    }`;
  });

  return (
    bucketLines.join("\n") +
    "\n" +
    `${metricName}_bucket{${labelStringPrefix}le="+Inf"} ${aggregate.count}` +
    "\n" +
    `${metricName}_sum{${labelPermutationKey}} ${aggregate.sum}` +
    "\n" +
    `${metricName}_count{${labelPermutationKey}} ${aggregate.count}`
  );
}

export interface IHistogram {
  record: (event: IHistogramEvent) => void;
  report: () => string;
}

export function makeHistogram(
  config: IHistogramMetric,
  statsdClient: StatsD
): IHistogram {
  const { help, type, protocol } = config;
  const name = `${protocol}.${config.name}`;
  const client = statsdClient;

  const allowedLabelPermutations = getLabelPermutations(config.labels);

  const mapOfAggregates: { [key: string]: IHistogramObservationAggregate } = {};

  allowedLabelPermutations.forEach(permutation => {
    // initialize all allowed permutations to a bunch of empty buckets.
    const initializedAggregate: IHistogramObservationAggregate = {
      buckets: {},
      sum: 0,
      count: 0
    };

    if (protocol === "prometheus") {
      const pConfig = config as IHistogramMetricPrometheus;
      pConfig.buckets.forEach(bucketLimit => {
        initializedAggregate.buckets[bucketLimit.toString()] = 0;
      });
    }

    mapOfAggregates[permutation] = initializedAggregate;

    // later, all other permutations will be rejected, so this
    // secures the counters against misbehaving clients who would
    // send unknown labels or values and crash poor prometheus.
  });

  const recordPrometheus = (event: IHistogramEvent) => {
    const labelPermutationKey = flattenLabels(event.labels);
    if (mapOfAggregates[labelPermutationKey]) {
      event.observations.forEach(observation => {
        addObservation(mapOfAggregates[labelPermutationKey], observation);
      });
    } else {
      console.log(`Disallowed label permutation ${labelPermutationKey}`);
    }
  };

  const recordStatsd = (event: IHistogramEvent) => {
    event.observations.forEach(observation => {
      client.histogram(name, observation, event.labels);
    });
  };

  return {
    record(event: IHistogramEvent) {
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

      const bodyLines = Object.keys(mapOfAggregates).map(
        labelPermutationKey => {
          const aggregate = mapOfAggregates[labelPermutationKey];
          return printObservationAggregate(
            name,
            labelPermutationKey,
            aggregate
          );
        }
      );

      return headerLines.join("\n") + "\n" + bodyLines.join("\n");
    }
  };
}
