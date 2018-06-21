/* @flow */
import { makeCounter } from "../counter";
import { MetricConfig } from "../util";

declare interface IExpectable<T> {
  toBe: (t: T) => void;
  toBeNull: () => void;
  toBeTruthy: () => void;
  toBeFalsy: () => void;
  toContain: (t: any) => void;
  toEqual: (t: T) => void;
  not: IExpectable<T>;
}

declare type DoneCb = () => void;

declare function beforeAll(prepare: ((done: DoneCb) => void)): void;
declare function describe(description: string, tests: (() => void)): void;
declare function fdescribe(description: string, tests: (() => void)): void;
declare function xdescribe(description: string, tests: (() => void)): void;
declare function it(description: string, test: ((done: DoneCb) => void)): void;
declare function xit(description: string, test: ((done: DoneCb) => void)): void;
declare function fit(description: string, test: ((done: DoneCb) => void)): void;
declare function expect<T>(x: T): IExpectable<T>;
declare function fail(description: string): void;

describe("Counters", () => {
  const counterConfig: MetricConfig = {
    name: "usage_total",
    help: "counts of usage, like times a feature has been used, etc",
    type: "counter",
    protocol: "prometheus",
    labels: [
      {
        name: "browser",
        allowedValues: ["chrome", "firefox", "safari", "edge"]
      },
      {
        name: "feature",
        allowedValues: [
          "quickQuestion",
          "selfPacedMode",
          "blockStudent",
          "showContent"
        ]
      }
    ]
  };

  it("has this test", () => {
    const counter = makeCounter(counterConfig, null);
    counter.record({
      metricType: "counter",
      metricName: "usage_total",
      labels: { browser: "chrome", feature: "selfPacedMode" },
      inc: 5
    });

    counter.record({
      metricType: "counter",
      metricName: "usage_total",
      labels: { browser: "firefox", feature: "selfPacedMode" },
      inc: 3
    });

    counter.record({
      metricType: "counter",
      metricName: "usage_total",
      labels: { browser: "chrome", feature: "selfPacedMode" },
      inc: 1
    });

    const expected = `# HELP usage_total counts of usage, like times a feature has been used, etc
# TYPE usage_total counter
usage_total{browser="chrome",feature="quickQuestion"} 0
usage_total{browser="chrome",feature="selfPacedMode"} 6
usage_total{browser="chrome",feature="blockStudent"} 0
usage_total{browser="chrome",feature="showContent"} 0
usage_total{browser="firefox",feature="quickQuestion"} 0
usage_total{browser="firefox",feature="selfPacedMode"} 3
usage_total{browser="firefox",feature="blockStudent"} 0
usage_total{browser="firefox",feature="showContent"} 0
usage_total{browser="safari",feature="quickQuestion"} 0
usage_total{browser="safari",feature="selfPacedMode"} 0
usage_total{browser="safari",feature="blockStudent"} 0
usage_total{browser="safari",feature="showContent"} 0
usage_total{browser="edge",feature="quickQuestion"} 0
usage_total{browser="edge",feature="selfPacedMode"} 0
usage_total{browser="edge",feature="blockStudent"} 0
usage_total{browser="edge",feature="showContent"} 0`;
    expect(counter.report()).toBe(expected);
  });
});
