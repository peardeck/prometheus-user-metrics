/* @flow */

import { getLabelPermutations, flattenLabels } from './util';
import type { CounterMetric, CounterEvent } from './util';

export type Counter = {
    record: (event: CounterEvent) => void,
    report: () => string,
};

export function makeCounter(config: CounterMetric) : Counter {
    const { name, help, type } = config;

    const allowedLabelPermutations = getLabelPermutations(config.labels);
    const counterValues = {};
    allowedLabelPermutations.forEach((permutation) => {
        // initialize all allowed permutations to zero.
        counterValues[permutation] = 0;

        // later, all other permutations will be rejected, so this 
        // secures the counters against misbehaving clients who would
        // send unknown labels or values and crash poor prometheus.
    });

    return {
        record(event: CounterEvent) {
            const labelPermutationKey = flattenLabels(event.labels);
            if (typeof counterValues[labelPermutationKey] === 'number') {
                counterValues[labelPermutationKey] += event.inc;
            } else {
                console.log(`Disallowed label permutation ${labelPermutationKey}`);
            }
        },

        report() {
            let headerLines = [
                `# HELP ${name} ${help}`,
                `# TYPE ${name} ${type}`
            ];

            let bodyLines = Object.keys(counterValues).map((labelPermutationKey) => {
                const value = counterValues[labelPermutationKey];
                return `${name}{${labelPermutationKey}} ${value}`;
            });

            return headerLines.join('\n') + '\n' + bodyLines.join('\n');
        }
    }
}