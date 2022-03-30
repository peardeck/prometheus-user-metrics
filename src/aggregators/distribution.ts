import { StatsD } from "hot-shots";

import {
  IDistributionEvent,
  IDistributionMetric,
} from "./util";

export interface IDistribution {
  record: (event: IDistributionEvent) => void;
}

export function makeDistribution(
  config: IDistributionMetric,
  statsdClient: StatsD
): IDistribution {
  const { protocol } = config;
  const name = `${protocol}.${config.name}`;
  const client = statsdClient;

  const recordStatsd = (event: IDistributionEvent) => {
    event.observations.forEach(observation => {
      client.distribution(name, observation, event.labels);
    });
  };

  return {
    record(event: IDistributionEvent) {
      if (protocol === "statsd") {
        recordStatsd(event);
      } else {
        console.log(`Unknown protocol: ${protocol}`);
      }
    }
  };
}
