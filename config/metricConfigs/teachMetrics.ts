import { MetricsConfig } from "../../src/aggregators/util";

const allowedMetrics: MetricsConfig = [
  {
    name: "te_editor_page_load_time",
    help: "Measures the time to load the teach editor",
    type: "histogram",
    labels: [
      {
        name: "appName",
        allowedValues: ["teach-editor"]
      },
      {
        name: "contentType",
        allowedValues: [
          "course", 
          "assessment",
          "practice",
        ]
      },
      {
        name: "underThreshold",
        allowedValues: ["true", "false"]
      }
    ],
    protocol: "statsd"
  },
];

export default allowedMetrics;
