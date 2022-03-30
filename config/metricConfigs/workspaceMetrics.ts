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
  {
    name: "workspace_count_crashed_sessions",
    help: "The amount of sessions that crashed",
    type: "counter",
    labels: [
      {
        name: "editor",
        allowedValues: ["JupyterLab", "RStudio"]
      }
    ],
    protocol: "statsd"
  },
  {
    name: "workspace_time_to_initial_content_render_start",
    help: "measures the time to render any content of a workspace",
    type: "distribution",
    labels: [
      {
        name: "navigationType",
        allowedValues: ["unknown", "initial", "client-side"]
      }
    ],
    protocol: "statsd"
  },
];

export default allowedMetrics;
