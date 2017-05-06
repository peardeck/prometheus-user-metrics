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

## Try it locally!

1. Clone repo
2. `docker-compose up`
3. Browse to http://localhost:8080

## Pictures You Can Use to Impress Your Friends

Github's Frontend Response Time Graph is a snap! We can literally generate this graph for you AND let you set alarms on it without any manual instrumentation on your part. See https://githubengineering.com/browser-monitoring-for-github-com/ for how Github uses these metrics.

![Github's Frontend Response Time Graph](https://cloud.githubusercontent.com/assets/187987/7738101/d9892654-ff05-11e4-8d62-340091dada79.png)

Here's how the demo for this project loads the same graph:
![The graph from this project](/navigationtiming.png?raw=true)

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

1. EZ-setup: just add this snippet to your HTML:

```
// copied from Google Analytics Snippet, adapted for Prometheus Aggregator
(function(i,s,o,g,r,a,m){i['PrometheusAggregatorObjectName']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=(g+'/static/aggregatorClient.js');m.parentNode.insertBefore(a,m);
i[r].aggregatorServerRoot = g;
})(window,document,'script','http://localhost:3000','prometheusAggregator');
```


That's it! It's already collecting enough metrics to do github's user monitoring in the Sweet Graph above. If you want to collect custom metrics, then you'd need to add them to a whitelist. Once you have that set up (it's just a [config file](/config/metricConfigs/appMetricConfig.json)), then you can monitor metrics like: 

1. How much does this page get loaded?
```
prometheusAggregator('increment', 'app_load_succeeded', { app: 'whateverAppId'}, 1);
```

2. How many users are using the new feature we launched?
```
featureButton.on('click', () => {
    doFeatureX();
    prometheusAggregator('increment', 'feature_usage_total', { feature: 'whateverFeatureName'}, 1);
});
```

3. TODO: What's the average latency to a third-party service like firebase?
```
prometheusAggregator('observe', 'firebase_latency', { firebaseHost: 'whatever.firebaseio.com' }, measuredLatency)
```

The client aggregates all the metrics and sends them to the aggregator at an interval of X seconds. The aggregator automatically gains some notion of how many clients are connected with `rate(clientSamples) / X`

## The Future of this Project

We use this in production at Pear Deck and it's pretty great. We don't know how widely applicable it is. Let us know by leaving an issue or starring the project! You can also email us at hello@peardeck.com.