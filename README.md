# User Monitoring for Prometheus

Prometheus, a [Cloud Native Computing Foundation](https://cncf.io/) project, is a systems and service monitoring system. *This* project provides the infrastructure you need to do end-user monitoring in Prometheus as well.

## Designed for use cases like:

* Set alarms for spikes in page load times or error rates!
* Measure real experienced latencies for API calls!
* You don't control Firebase (insert your favorite third-party "serverless" thing here) but now you can monitor how your users are experiencing it!
* Understand how much usage a newly-deployed feature is getting!
* Use alarms as end-to-end tests by getting a slack message when a usage pattern changes dramatically! Automatically warn yourselves if your usage drops from last week - either overall or for a particular feature!
* No need for third-party services that compromise your users' privacy or security!
* Easy to set up and cheap to run!

## Pictures You Can Use to Impress Your Friends

Github's Frontend Response Time Graph is a snap! We can literally generate this graph for you AND let you set alarms on it without any manual instrumentation on your part. See https://githubengineering.com/browser-monitoring-for-github-com/ for how Github uses these metrics.

![Github's Frontend Response Time Graph](https://cloud.githubusercontent.com/assets/187987/7738101/d9892654-ff05-11e4-8d62-340091dada79.png)

Wow, your super-cool Slack-ops channel can be even more glib about outages... NOW FOR THE END USER!
![Slack Ops](/SweetSlackOps.png?raw=true "Your users can't get their S3 photos, but your monitoring is pretty cool!")

You don't control Firebase (insert your third-party "serverless" thing here) but now you can monitor how your users are experiencing it!

## How it works

The challenge in monitoring your real users' experiences is that Prometheus can't scrape their clients, so this project adds a service that Prometheus CAN scrape, and provides an API that your clients can PUSH their metrics too. We provide client-side libraries to make that a snap.

![Prometheus User Monitoring Architecture Diagram](/PrometheusUserMonitoringArchitecture.png?raw=true "Prometheus User Monitoring Architecture")

## How to use it

### Server-side

1. Put the aggregator in your cloud. Prometheus will notice it automatically by its annotations! 
`kubectl apply -f prometheus-user-monitoring-aggregator.yaml`

2. Make a route through your gateway so clients can reach the aggregator. For testing it out, this could just be 
`kubectl port-forward $(kubectl  get pod -l app=prometheus-user-monitoring-aggregator  -o=jsonpath={.items[*].metadata.name}) 3000` 

### Client-side (JS)

1. EZ-setup: just add a script tag
`<script src='http://localhost:3000/prometheusUserMonitoringClient.js'></script>`

That's it! It's already collecting enough metrics to do github's user monitoring in the Sweet Graph above. If you want to collect more metrics like:

2. Average latency to API
```
const histogram = prometheusUserMonitoringClient.makeHistogram("my_api_histogram");

const startTime = Date.now();
makeApiCall().then(() => {
    histogram.observe(Date.now() - startTime);
});
```

3. How many users are using the new feature we launched?
```
const counter = prometheusUserMonitoringClient.makeCounter("feature_x_usage_total");

featureButton.on('click', () => {
    doFeatureX();
    counter.increment();
});
```

Etc! Of course prometheus labels are supported, blah blah.

The client aggregates all the metrics and sends them to the aggregator at an interval of X seconds. The aggregator automatically gains some notion of how many clients are connected with `rate(clientSamples) / X`