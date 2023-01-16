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
      },
      {
        name: "editorType",
        allowedValues: ["iframeEditor", "dcStudioEditor"]
      },
      {
        name: "workspaceState",
        allowedValues: ["unknown", "new", "existing"]
      }
    ],
    protocol: "statsd"
  },
  {
    name: "workspace_time_to_session_ready_for_editor_start",
    help: "measures the time between session started and editor loaded",
    type: "distribution",
    labels: [
      {
        name: "editor",
        allowedValues: ["JupyterLab", "RStudio"]
      },
      {
        name: "editorType",
        allowedValues: ["iframeEditor", "dcStudioEditor"]
      },
      {
        name: "workspaceState",
        allowedValues: ["unknown", "new", "existing"]
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
    name: "workspace_count_restart_sessions",
    help: "The amount of sessions that restarted in DCStudio",
    type: "counter",
    labels: [
      {
        name: "mode",
        allowedValues: ["executing", "viewing", "editing"]
      },
      {
        name: "reason",
        allowedValues: [
          "unknown",
          "loading",
          "no-saving",
          "not-allowed",
          "offline",
          "context-not-ready",
          "kernel-broken",
          "no-context",
          "no-kernel",
          "session-broken"
        ]
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
      },
      {
        name: "workspaceState",
        allowedValues: ["unknown", "new", "existing"]
      },
      {
        name: "experimentalSyncBackend",
        allowedValues: ["true", "false"]
      }
    ],
    protocol: "statsd"
  },
  {
    name: "workspace_cpu_usage",
    help: "measures the cpu usage of a workspace",
    type: "distribution",
    labels: [
      {
        name: "accountReferenceType",
        allowedValues: ["group", "personal"]
      },
      {
        name: "isPremium",
        allowedValues: ["true", "false"]
      },
      {
        name: "isNotebookRunning",
        allowedValues: ["true", "false"]
      },
      {
        name: "language",
        allowedValues: ["R", "Python"]
      },
      {
        name: "sourceTag",
        allowedValues: ["workspace", "integration", "template", "github", "project", "rdocs"]
      }
    ],
    protocol: "statsd"
  },
  {
    name: "workspace_ram_usage",
    help: "measures the ram usage of a workspace",
    type: "distribution",
    labels: [
      {
        name: "accountReferenceType",
        allowedValues: ["group", "personal"]
      },
      {
        name: "isPremium",
        allowedValues: ["true", "false"]
      },
      {
        name: "isNotebookRunning",
        allowedValues: ["true", "false"]
      },
      {
        name: "language",
        allowedValues: ["R", "Python"]
      },
      {
        name: "sourceTag",
        allowedValues: ["workspace", "integration", "template", "github", "project", "rdocs"]
      }
    ],
    protocol: "statsd"
  },
  {
    name: "workspace_time_to_load_dashboard",
    help: "measures the time to render completely the dashboard",
    type: "distribution",
    labels: [],
    protocol: "statsd"
  },
  {
    name: "workspace_time_to_load_publication",
    help: "measures the time to render completely a publication",
    type: "distribution",
    labels: [],
    protocol: "statsd"
  },
  {
    name: "workspace_time_to_load_editor",
    help: "measures the time to render the first cell in DCStudio",
    type: "distribution",
    labels: [],
    protocol: "statsd"
  },
  {
    name: "workspace_count_show_limit_cpu_ram_usage",
    help: "the amount of times users were shown the CPU/RAM limit usage banner in a workspace",
    type: "counter",
    labels: [
      {
        name: "resource",
        allowedValues: ["CPU", "RAM"]
      }
    ],
    protocol: "statsd"
  },
];

export default allowedMetrics;
