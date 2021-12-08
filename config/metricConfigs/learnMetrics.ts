import { MetricsConfig } from "../../src/aggregators/util";

const allowedMetrics: MetricsConfig = [
  {
    name: "le_count_crashed_sessions",
    help: "Count the number of sessions that crashed",
    type: "counter",
    labels: [
      {
        name: "appName",
        allowedValues: ["campus-app"]
      },
      {
        name: "multiplexerUrl",
        allowedValues: [
          "https://multiplexer-prod.datacamp.com",
          "https://multiplexer-paid.datacamp.com"
        ]
      }
    ],
    protocol: "statsd"
  },
  {
    name: "le_time_workspace_to_be_ready",
    help: "measures the time to get the workspace ready for a user",
    type: "histogram",
    labels: [
      {
        name: "appName",
        allowedValues: ["campus-app", "projects"]
      },
      {
        name: "multiplexerUrl",
        allowedValues: [
          "https://multiplexer-prod.datacamp.com",
          "https://multiplexer-paid.datacamp.com"
        ]
      },
      {
        name: "language",
        allowedValues: ["r", "revo", "sql", "python", "shell"]
      }
    ],
    protocol: "statsd"
  },
  {
    name: "le_time_to_submit_code",
    help: "measures the time to submit a code and get the response",
    type: "histogram",
    labels: [
      {
        name: "appName",
        allowedValues: ["campus-app"]
      },
      {
        name: "multiplexerUrl",
        allowedValues: [
          "https://multiplexer-prod.datacamp.com",
          "https://multiplexer-paid.datacamp.com"
        ]
      },
      {
        name: "language",
        allowedValues: ["r", "revo", "sql", "python", "shell"]
      }
    ],
    protocol: "statsd"
  },
  {
    name: "le_count_report_sent",
    help: "Count the number of reports reported",
    type: "counter",
    labels: [
      {
        name: "appName",
        allowedValues: ["campus-app", "projects"]
      }
    ],
    protocol: "statsd"
  },
  {
    name: "le_time_to_submit_task",
    help: "measures the time to submit a task and get the response",
    type: "histogram",
    labels: [
      {
        name: "appName",
        allowedValues: ["projects"]
      },
      {
        name: "multiplexerUrl",
        allowedValues: [
          "https://multiplexer-prod.datacamp.com",
          "https://multiplexer-paid.datacamp.com"
        ]
      },
      {
        name: "language",
        allowedValues: ["r", "revo", "sql", "python", "shell"]
      }
    ],
    protocol: "statsd"
  },
  {
    name: "le_count_timeouts",
    help: "Count the number of timeouts",
    type: "counter",
    labels: [
      {
        name: "appName",
        allowedValues: ["projects"]
      },
      {
        name: "multiplexerUrl",
        allowedValues: [
          "https://multiplexer-prod.datacamp.com",
          "https://multiplexer-paid.datacamp.com"
        ]
      },
      {
        name: "language",
        allowedValues: ["r", "revo", "sql", "python", "shell"]
      }
    ],
    protocol: "statsd"
  },
  {
    name: "le_count_crashed_notebooks",
    help: "Count the number of notebooks that crashed",
    type: "counter",
    labels: [
      {
        name: "appName",
        allowedValues: ["projects"]
      },
      {
        name: "multiplexerUrl",
        allowedValues: [
          "https://multiplexer-prod.datacamp.com",
          "https://multiplexer-paid.datacamp.com"
        ]
      }
    ],
    protocol: "statsd"
  },
  {
    name: "count_failed_auth_call",
    help: "Count the number of failed authentication calls",
    type: "counter",
    labels: [
      {
        name: "appName",
        allowedValues: ["campus-app"]
      },
      {
        name: "status_code",
        allowedValues: ["none", "200", "400", "403", "404", "500", "502", "503", "504", "untracked"]
      },
      {
        name: "timeout",
        allowedValues: ["true", "false"]
      },
      {
        name: "attempt",
        allowedValues: ["1", "2"]
      },
    ],
    protocol: "statsd"
  },
  {
    name: "learn_hub__time_to_initial_dashboard_load",
    help: "Measure the time to interactive on the learn hub dashboard",
    type: "histogram",
    labels: [
      {
        name: "appName",
        allowedValues: ["/learn"]
      },
      {
        name: "pageName",
        allowedValues: ["dashboard"]
      },
      {
        name: "underThreshold",
        allowedValues: ["true", "false"]
      },
    ],
    protocol: "statsd"
  }
];

export default allowedMetrics;
