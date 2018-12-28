import { MetricsConfig } from '../../src/aggregators/util';

const allowedMetrics: MetricsConfig = [
  {
    name: 'sa_check_item',
    help: 'Time it takes to check a skill assessment item',
    type: 'histogram',
    labels: [
      {
        name: 'appName',
        allowedValues: ['skill-assessment'],
      },
    ],
  },
];

export default allowedMetrics;
