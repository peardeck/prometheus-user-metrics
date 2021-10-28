import { MetricsConfig } from '../../src/aggregators/util';

const allowedMetrics: MetricsConfig = [
  {
    name: "workspace_time_to_session_loaded",
    help: "measures the time between session started and editor loaded",
    type: "histogram",
    labels: [
      {
        name: "editor",
        allowedValues: ["JupyterLab", "RStudio"]
      }
    ],
    protocol: "statsd"
  },
];

export default allowedMetrics;
