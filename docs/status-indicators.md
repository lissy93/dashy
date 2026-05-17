# Status Indicators

Dashy has an optional feature that can display a small icon next to each of your running service or host, indicating it's current status (operation or online). This can be useful if you are using Dashy as your homelab's start page, as it gives you an overview of the health of each of your running services and hosts. The status and ping features will show response time, response code, online / offline check and if applicable, a relevant error message.

<p align="center">
  <img width="800" src="/docs/assets/status-check-demo.gif" />
</p>

## Enabling Status Indicators

By default, this feature is off. If you do not want this feature, just don't add the `statusCheck` or `pingCheckEnabled` to your conf.yml file, then no requests will be made.

To enable status checks, you can either turn it on for all items, by setting `appConfig.statusCheck: true`, like:

```yaml
appConfig:
  statusCheck: true
```

To enable ping checks, you can either turn it on for all items, by setting `appConfig.pingCheckEnabled: true`, like:

```yaml
appConfig:
  pingCheckEnabled: true
```

Or you can enable/disable it on a per-item basis, with the `item[n].statusCheck` and  `item[n].pingCheckEnabled` attributes

```yaml
sections:
- name: Firewall
  items:
  - title: OPNsense
    description: Firewall Central Management
    icon: networking/opnsense.png
    url: https://192.168.1.1
    statusCheck: false
  - title: MalTrail
    description: Malicious traffic detection system
    icon: networking/maltrail.png
    url: http://192.168.1.1:8338
    statusCheck: true
  - title: Ntopng
    description: Network traffic probe and network use monitor
    icon: networking/ntop.png
    url: http://192.168.1.1:3001
    statusCheck: true
    pingCheckEnabled: true
    pingCheckHost: 192.168.1.1
```

## Continuous Checking

By default, with status indicators enabled Dashy will check an application or host status on page load, and will not keep indicators updated. This is usually the desirable behavior. However, if you do want the status indicators to continue to poll your running services or hosts, this can be enabled by setting the `statusCheckInterval` or `pingCheckInterval` attributes. Here you define an interval as an integer in seconds, and Dashy will poll your apps or hosts every x seconds. Note that if this number is very low (below 5 seconds), you may notice the app running slightly slower.

The following example, will instruct Dashy to continuously check the status of your services and hosts every 20 seconds.

```text
appConfig:
  statusCheck: true
  statusCheckInterval: 20
  pingCheckInterval: 5
```

## Using a Different Endpoint

By default, the status checker will use the URL of each application being checked. In some situations, you may want to use a different endpoint for status checking. Similarly, some services provide a dedicated path for uptime monitoring.

You can set the `statusCheckUrl` property on any given item in order to do this. The status checker will then ping that endpoint, instead of the apps main `url` property.

## Setting Custom Headers

If your service is responding with an error, despite being up and running, it is most likely because custom headers for authentication, authorization or encoding are required. You can define these headers under the `statusCheckHeaders` property for any service. It should be defined as an object format, with the name of header as the key, and header content as the value.
For example, `statusCheckHeaders: { 'X-Custom-Header': 'foobar' }`

## Disabling Security

By default, (if you're using HTTPS) any requests to insecure or non-HTTPS content will be blocked. This will cause the status check to fail. If you trust the endpoint (e.g. you're self-hosting it), then you can disable this security measure for an individual item. This is done by setting `statusCheckAllowInsecure: true`

## Allowing Alternative Status Codes

If you expect your service to return a status code that is not in the 2XX range, and still want the indicator to be green, then you can specify an expected status code under `statusCheckAcceptCodes` for a given item. For example, `statusCheckAcceptCodes: '403,418'`

## Troubleshooting Failing Status Checks

If you're using status checks, and despite a given service being online, the check is displaying an error, there are a couple of things you can look at:

If your service requires requests to include any authorization in the headers, then use the  `statusCheckHeaders` property, as described  [above](#setting-custom-headers).

If you are still having issues, it may be because your target application is blocking requests from Dashy's IP. This is a [CORS error](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS), and can be fixed by setting the headers on your target app, to include:

```text
Access-Control-Allow-Origin: https://location-of-dashy/
Vary: Origin
```

If the URL you are checking has an unsigned certificate, or is not using HTTPS, then you may need to disable the rejection of insecure requests. This can be done by setting `statusCheckAllowInsecure` to true for a given item.

If your service is online, but responds with a status code that is not in the 2xx range, then you can use `statusCheckAcceptCodes` to set an accepted status code.

If you get an error, like `Service Unavailable: Server resulted in a fatal error`, even when it's definitely online, this is most likely caused by missing the protocol. Don't forget to include `https://` (or whatever protocol) before the URL, and ensure that if needed, you've specified the port.

Running Dashy in HOST network mode, instead of BRIDGE will allow status check access to other services in HOST mode. For more info, see [#445](https://github.com/Lissy93/dashy/discussions/445).

If you have firewall rules configured, then ensure that they don't prevent Dashy from making requests to the other services you are trying to access.

Currently, the status check needs a page to be rendered, so if this URL in your browser does not return anything, then status checks will not work. This may be modified in the future, but in the meantime, a fix would be to make your own status service, which just checks if your app responds with whatever code you'd like, and then return a 200 plus renders an arbitrary message. Then just point `statusCheckUrl` to your custom page.

For further troubleshooting, use an application like [Postman](https://postman.com) to diagnose the issue. Set the parameter to `GET`, and then make a call to: `https://[url-of-dashy]/status-check/?&url=[service-url]`. Where the service URL must have first been encoded (e.g. with `encodeURIComponent()` or [urlencoder.io](https://www.urlencoder.io/))

If you're serving Dashy though a CDN, instead of using the Node server or Docker image, then the Node endpoint that makes requests will not be available to you, and all requests will fail. A workaround for this may be implemented in the future, but in the meantime, your only option is to use the Docker or Node deployment method.

## Color-Blind Accessibility

The default indicators rely on color alone to illustrate status (green, yellow, red and grey). For greater visual distinction and colorblind support, the accessibility mode will use shapes instead of dots to show status. This can be enabled by setting `appConfig.statusCheckAccessibility: true` or `appConfig.pingCheckAccessibility: true`.

By default, this will be: circle (online), square (offline), triangle (checking) and diamond (timed out).

```yaml
appConfig:
  statusCheck: true
  statusCheckAccessibility: true
  pingCheckAccessibility: true
```

Alternatively, you can set your own colors for status indicators, with these variables: `--success`, `--warning`, `--danger`, see: [modifying theme colors](/docs/theming.md#modifying-theme-colors).

## How it Works

When the app is loaded, if `appConfig.statusCheck: true` or `appConfig.pingCheckEnabled: true` are set, or if any items have the `statusCheck: true` or `pingCheckEnabled: true` enabled, then Dashy will make a request, to `https://[your-host-name]/status-check?&url=[address-or-servce]` or `https://[your-host-name]/ping-check?&host=[hostname-or-ip]` (may also include GET params for headers and the secure flag for status check or ping count and timeout GET params for ping checks), which in turn will ping that running service or host, and respond with a status code. Response time is calculated from the difference between start and end time of the request for the status check of on the return of the ping command for the ping check.

When the response completes, an indicator will display next to each item. The color denotes the status: Yellow while waiting for the response to return, green if request was successful, red if it failed, and grey if it was unable to make the request all together.

All requests are made straight from your server, there is no intermediary. So providing you are hosting Dashy yourself, and are checking the status of other self-hosted services, there shouldn't be any privacy concerns. Requests are made asynchronously, so this won't have any significant impact on page load speeds. However recurring requests (using `statusCheckInterval` or `pingCheckInterval`) may run more slowly if the interval between requests is very short.
