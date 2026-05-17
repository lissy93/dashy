# App Management

_The following article is a primer on managing self-hosted apps. It covers everything from keeping the Dashy (or any other app) up-to-date, secure, backed up, to other topics like auto-starting, monitoring, log management, web server configuration and using custom domains._

## Contents

- [Providing Assets](#providing-assets)
- [File Ownership and Permissions](#file-ownership-and-permissions)
- [Running Commands](#running-commands)
- [Healthchecks](#healthchecks)
- [Logs and Performance](#logs-and-performance)
- [Auto-Starting at Boot](#auto-starting-at-system-boot)
- [Updating](#updating)
- [Backing Up](#backing-up)
- [Scheduling](#scheduling)
- [SSL Certificates](#ssl-certificates)
- [Authentication](#authentication)
- [Network Exposure](#network-exposure)
- [Managing with Compose](#managing-containers-with-docker-compose)
- [Environmental Variables](#passing-in-environmental-variables)
- [Setting Headers](#setting-headers)
- [Remote Access](#remote-access)
- [Custom Domain](#custom-domain)
- [Securing Containers](#container-security)
- [Web Server Configuration](#web-server-configuration)
- [Running a Modified App](#running-a-modified-version-of-the-app)
- [Building your Own Container](#building-your-own-container)

---

## Providing Assets

Dashy reads everything for your dashboard from a single host directory mounted into the container at `/app/user-data`. This is done with a [Docker volume](https://docs.docker.com/storage/volumes/), e.g. `-v /path/to/your/user-data:/app/user-data`.

The directory must contain a `conf.yml`. It can also contain anything else you want served from the web root: sub-config files for additional pages, item icons, favicon, fonts, custom CSS, manifest, and so on. Any file placed there is reachable at `/<filename>` in the browser, overriding files of the same name in the bundled `public/` defaults.

Typical contents:

- `conf.yml` - Main config (required)
- `*.yml` / `*.yaml` - Sub-config files for [multi-page support](/docs/pages-and-sections.md#multi-page-support)
- `item-icons/` - Local icons referenced by `icon: ./item-icons/foo.png`
- `favicon.ico`, `manifest.json`, `robots.txt` - Override the bundled defaults
- `fonts/`, `widget-resources/` - Custom fonts or assets used by widgets

**[⬆️ Back to Top](#management)**

---

## File Ownership and Permissions

Inside the container, Dashy runs as a non-root user with uid/gid 1000 (the built-in `node` user from the Node base image). This is fine for the vast majority of installs, since the first user on a default Linux or macOS box is also uid 1000, so a bind-mounted `user-data` directory is read/writable straight away.

It only gets fiddly if your host uid happens to be something else (NAS systems and multi-user servers being the usual culprits). In that case, config saves from the UI will fail with a permission error, because the container's uid 1000 doesn't own your directory.

There are two ways to sort it. Pick whichever is less hassle:

1. **Run the container as your own user.** The cleanest option, since you don't touch host file ownership.

   On `docker run`:
   ```bash
   docker run -d -p 8080:8080 \
     --user $(id -u):$(id -g) \
     -v /path/to/user-data:/app/user-data \
     lissy93/dashy:latest
   ```

   In compose, uncomment the `user:` line under the service and set it:
   ```yaml
   user: "1001:1001"   # whatever `id -u` and `id -g` give you
   ```

2. **Hand the directory to uid 1000.** Quicker if you don't mind changing host ownership:
   ```bash
   sudo chown -R 1000:1000 /path/to/user-data
   ```

Note that if you run the container as root (e.g. `--user 0:0`), Dashy will still work, but you lose the security benefit of a non-root container. Don't do that unless you've a good reason.

**[⬆️ Back to Top](#management)**

---

## Running Commands

If you're running an app in Docker, then commands will need to be passed to the container to be executed. This can be done by preceding each command with `docker exec -it [container-id]`, where container ID can be found by running `docker ps`. For example `docker exec -it 26c156c467b4 yarn build`. You can also enter the container, with `docker exec -it [container-id] /bin/ash`, and navigate around it with normal Linux commands.

Dashy has several commands that can be used for various tasks, you can find a list of these either in the [Developing Docs](/docs/developing.md#project-commands), or by looking at the [`package.json`](https://github.com/Lissy93/dashy/blob/master/package.json#L5). These can be used by running `yarn [command-name]`.

**[⬆️ Back to Top](#management)**

---

## Healthchecks

Healthchecks are configured to periodically check that Dashy is up and running correctly on the specified port. By default, the health script is called every 5 minutes, but this can be modified with the `--health-interval` option. You can check the current container health with: `docker inspect --format "{{json .State.Health }}" [container-id]`, and a summary of health status will show up under `docker ps`. You can also manually request the current application status by running `docker exec -it [container-id] yarn health-check`. You can disable healthchecks altogether by adding the `--no-healthcheck` flag to your Docker run command.

To restart unhealthy containers automatically, check out [Autoheal](https://hub.docker.com/r/willfarrell/autoheal/). This image watches for unhealthy containers, and automatically triggers a restart. (This is a stand in for Docker's `--exit-on-unhealthy` that was proposed, but [not merged](https://github.com/moby/moby/pull/22719)). There's also [Deunhealth](https://github.com/qdm12/deunhealth), which is super light-weight, and doesn't require network access.

```bash
docker run -d \
    --name autoheal \
    --restart=always \
    -e AUTOHEAL_CONTAINER_LABEL=all \
    -v /var/run/docker.sock:/var/run/docker.sock \
    willfarrell/autoheal
```

### HTTP Healthcheck Endpoint

Dashy also exposes an unauthenticated HTTP liveness endpoint at `/healthz`, which returns a `200` with a small JSON body (`status`, `uptime`, `version`). It bypasses auth and SSL redirection so probes keep working regardless of how Dashy is configured.

Useful when fronting Dashy with a load balancer / reverse proxy that needs an HTTP probe for auto-failover, or when running on Kubernetes:

```yaml
# Kubernetes
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
```

```yaml
# Traefik (label on the Dashy service)
- "traefik.http.services.dashy.loadbalancer.healthcheck.path=/healthz"
- "traefik.http.services.dashy.loadbalancer.healthcheck.interval=30s"
```

```caddyfile
# Caddy (reverse_proxy block)
reverse_proxy dashy:8080 {
    health_uri  /healthz
    health_interval 30s
}
```

For Nginx Proxy Manager, set the *Forward Hostname* health-check path to `/healthz` under the proxy host's *Custom locations* / advanced config.

**[⬆️ Back to Top](#management)**

---

## Logs and Performance

### Container Logs

You can view logs for a given Docker container with `docker logs [container-id]`, add the `--follow` flag to stream the logs. For more info, see the [Logging Documentation](https://docs.docker.com/config/containers/logging/). There's also [Dozzle](https://dozzle.dev/), a useful tool, that provides a web interface where you can stream and query logs from all your running containers from a single web app.

### Container Performance

You can check the resource usage for your running Docker containers with `docker stats` or `docker stats [container-id]`. For more info, see the [Stats Documentation](https://docs.docker.com/engine/reference/commandline/stats/). There's also [cAdvisor](https://github.com/google/cadvisor), a useful web app for viewing and analyzing resource usage and performance of all your running containers.

### Management Apps

You can also view logs, resource usage and other info as well as manage your entire Docker workflow in third-party Docker management apps. For example [Portainer](https://github.com/portainer/portainer) an all-in-one open source management web UI  for Docker and Kubernetes, or [LazyDocker](https://github.com/jesseduffield/lazydocker) a terminal UI for Docker container management and monitoring.

### Advanced Logging and Monitoring

Docker supports using [Prometheus](https://prometheus.io/) to collect logs, which can then be visualized using a platform like [Grafana](https://grafana.com/). For more info, see [this guide](https://docs.docker.com/config/daemon/prometheus/). If you need to route your logs to a remote syslog, then consider using [logspout](https://github.com/gliderlabs/logspout). For enterprise-grade instances, there are managed services, that make monitoring container logs and metrics very easy, such as [Sematext](https://sematext.com/blog/docker-container-monitoring-with-sematext/) with [Logagent](https://github.com/sematext/logagent-js).

**[⬆️ Back to Top](#management)**

---

## Auto-Starting at System Boot

You can use Docker's [restart policies](https://docs.docker.com/engine/reference/run/#restart-policies---restart) to instruct the container to start after a system reboot, or restart after a crash. Just add the `--restart=always` flag to your Docker compose script or Docker run command. For more information, see the docs on [Starting Containers Automatically](https://docs.docker.com/config/containers/start-containers-automatically/).

For Podman, you can use `systemd` to create a service that launches your container, [the docs](https://podman.io/blogs/2018/09/13/systemd.html) explains things further. A similar approach can be used with Docker, if you need to start containers after a reboot, but before any user interaction.

To restart the container after something within it has crashed, consider using [`docker-autoheal`](https://github.com/willfarrell/docker-autoheal) by @willfarrell, a service that monitors and restarts unhealthy containers. For more info, see the [Healthchecks](#healthchecks) section above.

**[⬆️ Back to Top](#management)**

---

## Updating

Dashy is under active development, so to take advantage of the latest features, you may need to update your instance every now and again.

### Updating Docker Container

1. Pull latest image: `docker pull lissy93/dashy:latest`
2. Kill off existing container
	- Find container ID: `docker ps`
	- Stop container: `docker stop [container_id]`
	- Remove container: `docker rm [container_id]`
3. Spin up new container: `docker run [params] lissy93/dashy`

### Automatic Docker Updates

You can automate the above process using [Watchtower](https://github.com/containrrr/watchtower).
Watchtower will watch for new versions of a given image on Docker Hub, pull down your new image, gracefully shut down your existing container and restart it with the same options that were used when it was deployed initially.

To get started, spin up the watchtower container:

```bash
docker run -d \
  --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower
```

For more information, see the [Watchtower Docs](https://containrrr.dev/watchtower/)

### Updating Dashy from Source

Stop your current instance of Dashy, then navigate into the source directory. Pull down the latest code, with `git pull origin master`, then update dependencies with `yarn`, rebuild with `yarn build`, and start the server again with `yarn start`.

**[⬆️ Back to Top](#management)**

---

## Backing Up

### Backing Up Containers

You can make a backup of any running container really easily, using [`docker commit`](https://docs.docker.com/engine/reference/commandline/commit/) and save it with [`docker export`](https://docs.docker.com/engine/reference/commandline/export/), to do so:

- First find the container ID, you can do this with `docker container ls`
- Now to create the snapshot, just run `docker commit -p [container-id] my-backup`
- Finally, to save the backup locally, run `docker save -o ~/dashy-backup.tar my-backup`
- If you want to push this to a container registry, run  `docker push my-backup:latest`

Note that this will not include any data in docker volumes, and the process here is a bit different. Since these files exist on your host system, if you have an existing backup solution implemented, you can incorporate and volume files within that system.

### Backing Up Volumes

[offen/docker-volume-backup](https://github.com/offen/docker-volume-backup) is a useful tool for periodic Docker volume backups, to any S3-compatible storage provider. It's run as a light-weight Docker container, and is easy to setup, and also supports GPG-encryption, email notification, and routing away older backups.

To get started, create a docker-compose similar to the example below, and then start the container. For more info, check out their [documentation](https://github.com/offen/docker-volume-backup), which is very clear.

```yaml
services:
  backup:
    image: offen/docker-volume-backup:latest
    environment:
      BACKUP_CRON_EXPRESSION: "0 * * * *"
      BACKUP_PRUNING_PREFIX: backup-
      BACKUP_RETENTION_DAYS: 7
      AWS_BUCKET_NAME: backup-bucket
      AWS_ACCESS_KEY_ID: AKIAIOSFODNN7EXAMPLE
      AWS_SECRET_ACCESS_KEY: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
    volumes:
      - data:/backup/my-app-backup:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
volumes:
  data:
```

It's worth noting that this process can also be done manually, using the following commands:

Backup:

```bash
docker run --rm -v some_volume:/volume -v /tmp:/backup alpine tar -cjf /backup/some_archive.tar.bz2 -C /volume ./
```

Restore:

```bash
docker run --rm -v some_volume:/volume -v /tmp:/backup alpine sh -c "rm -rf /volume/* /volume/..?* /volume/.[!.]* ; tar -C /volume/ -xjf /backup/some_archive.tar.bz2"
```

### Dashy-Specific Backup

All configuration and dashboard settings are stored in your `user-data/conf.yml` file. If you provide additional assets (like icons, fonts, themes, etc), these will also live in the `user-data` directory. So to backup all Dashy data, this is the only directory you need to backup.

When you save config through the UI, Dashy automatically creates a timestamped backup in `user-data/config-backups/` (configurable via the `BACKUP_DIR` env var). If you break your config, check that directory for a recent copy. Backups can be disabled by setting `DISABLE_CONFIG_BACKUPS=true` (e.g. on read-only filesystems or where permissions don't allow it).

Since Dashy is open source, there shouldn't be any need to backup the main container.

Dashy also has a built-in cloud backup feature, which is free for personal users, and will let you make and restore fully encrypted backups of your config directly through the UI. To learn more, see the [Cloud Backup Docs](/docs/backup-restore.md)

**[⬆️ Back to Top](#management)**

---

## Scheduling

If you need to periodically schedule the running of a given command on Dashy (or any other container), then a useful tool for doing so it [ofelia](https://github.com/mcuadros/ofelia). This runs as a Docker container and is really useful for things like backups, logging, updating, notifications, etc. Crons are specified using Go's crontab format, and a useful tool for visualizing this is [crontab.guru](https://crontab.guru/). This can also be done natively with Alpine: `docker run -it alpine ls /etc/periodic`.
I recommend combining this with [healthchecks](https://github.com/healthchecks/healthchecks) for easy monitoring of jobs, and failure notifications.

**[⬆️ Back to Top](#management)**

---

## SSL Certificates

Enabling HTTPS with an SSL certificate is recommended, especially if you are hosting Dashy anywhere other than your home. This will ensure that all traffic is encrypted in transit.

### Auto-SSL

If you are using [NGINX Proxy Manager](https://nginxproxymanager.com/), then SSL is supported out of the box. Once you've added your proxy host and web address, then set the scheme to HTTPS, then under the SSL Tab select "Request a new SSL certificate" and follow the on-screen instructions.

If you're hosting Dashy behind Cloudflare, then they offer [free and easy SSL](https://www.cloudflare.com/en-gb/learning/ssl/what-is-an-ssl-certificate/)- all you need to do is enable it under the SSL/TLS tab. Or if you are using shared hosting, you may find [this tutorial](https://www.sitepoint.com/a-guide-to-setting-up-lets-encrypt-ssl-on-shared-hosting/) helpful.

### Getting a Self-Signed SSL Certificate

[Let's Encrypt](https://letsencrypt.org/docs/) is a global Certificate Authority, providing free SSL/TLS Domain Validation certificates in order to enable secure HTTPS access to your website. They have good browser/ OS [compatibility](https://letsencrypt.org/docs/certificate-compatibility/) with their ISRG X1 and DST CA X3 root certificates, support [Wildcard issuance](https://community.letsencrypt.org/t/acme-v2-production-environment-wildcards/55578) done via ACMEv2 using the DNS-01 and have [Multi-Perspective Validation](https://letsencrypt.org/2020/02/19/multi-perspective-validation.html). Let's Encrypt provide [CertBot](https://certbot.eff.org/) an easy app for generating and setting up an SSL certificate.

This process can be automated, using something like the [Docker-NGINX-Auto-SSL Container](https://github.com/Valian/docker-nginx-auto-ssl) to generate and renew certificates when needed.

If you're not so comfortable on the command line, then you can use a tool like [SSL For Free](https://www.sslforfree.com/) or [ZeroSSL](https://zerossl.com/) to generate your cert. They also provide step-by-step setup instructions for most platforms.

### Passing a Self-Signed Certificate to Dashy

Once you've generated your SSL cert, you'll need to pass it to Dashy. This can be done by specifying the paths to your public and private keys using the `SSL_PRIV_KEY_PATH` and `SSL_PUB_KEY_PATH` environmental variables. Or if you're using Docker, then just pass public + private SSL keys in under `/etc/ssl/certs/dashy-pub.pem` and `/etc/ssl/certs/dashy-priv.key` respectively, e.g:

```bash
docker run -d \
  -p 8080:8080 \
  -v ~/my-private-key.key:/etc/ssl/certs/dashy-priv.key:ro \
  -v ~/my-public-key.pem:/etc/ssl/certs/dashy-pub.pem:ro \
  lissy93/dashy:latest
```

By default the SSL port is `443` within a Docker container, or `4001` if running on bare metal, but you can override this with the `SSL_PORT` environmental variable.

Once everything is setup, you can verify your site is secured using a tool like [SSL Checker](https://www.sslchecker.com/sslchecker).

**[⬆️ Back to Top](#management)**

---

## Authentication

Dashy natively supports secure authentication using KeyCloak. There is also a Simple Auth feature that doesn't require any additional setup. Usage instructions for both, as well as alternative auth methods, has now moved to the **[Authentication Docs](/docs/authentication.md)** page.

**[⬆️ Back to Top](#management)**

---

## Network Exposure

Dashy is designed to run on your local network, behind your firewall. If you only access it from within your home or over a VPN, the defaults are fine.

If you do need to expose Dashy to the internet, you should put it behind a reverse proxy with its own authentication layer (e.g. Authelia, Authentik, Cloudflare Access, or your proxy's built-in auth). Don't rely solely on Dashy's built-in auth for internet-facing instances - it's a convenience feature for private networks, not a hardened perimeter control. See the [Authentication Docs](/docs/authentication.md) for setup options.

When Dashy runs in server mode (the default Docker setup), it exposes several API endpoints for things like status checks, ping checks, config saving, system info, and a CORS proxy used by widgets. When authentication is enabled (via `ENABLE_HTTP_AUTH=true` or `BASIC_AUTH_USERNAME`/`BASIC_AUTH_PASSWORD` env vars), all of these endpoints require valid credentials. Without auth configured, they are open. That's fine for private networks, but not appropriate for public access.

The CORS proxy (`/cors-proxy`) is worth calling out specifically: it forwards requests from the Dashy server to external URLs, so widgets can reach APIs that don't set CORS headers. On a private network this is harmless, but on an internet-exposed instance without auth, it could be abused as an open proxy. Always enable authentication if your instance is reachable from untrusted networks.

**[⬆️ Back to Top](#management)**

---

## Managing Containers with Docker Compose

When you have a lot of containers, it quickly becomes hard to manage with `docker run` commands. The solution to this is [docker compose](https://docs.docker.com/compose/), a handy tool for defining all a containers run settings in a single YAML file, and then spinning up that container with a single short command - `docker compose up`. A good example of which can be seen in [@abhilesh's docker compose collection](https://github.com/abhilesh/self-hosted_docker_setups).

You can use Dashy's default [`docker-compose.yml`](https://github.com/Lissy93/dashy/blob/master/docker-compose.yml) file as a template, and modify it according to your needs.

An example Docker compose, using the default base image from DockerHub, might look something like this:

```yaml
services:
  dashy:
    container_name: Dashy
    image: lissy93/dashy:latest
    volumes:
      - ./user-data:/app/user-data
    ports:
      - 4000:8080
    environment:
      - BASE_URL=/my-dashboard
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'node', '/app/services/healthcheck.js']
      interval: 1m30s
      timeout: 10s
      retries: 3
      start_period: 30s
```

**[⬆️ Back to Top](#management)**

---

## Passing in Environmental Variables

With Docker, you can define environmental variables under the `environment` section of your Docker compose file. Environmental variables are used to configure high-level settings, usually before the config file has been read. For a list of all supported env vars in Dashy, see [the developing docs](/docs/developing.md#environmental-variables), or the default [`.env`](https://github.com/Lissy93/dashy/blob/master/.env) file.

A common use case, is to run Dashy under a sub-page, instead of at the root of a URL (e.g. `https://my-homelab.local/dashy` instead of `https://dashy.my-homelab.local`). In this use-case, you'd specify the `BASE_URL` variable in your compose file.

```yaml
environment:
  - BASE_URL=/dashy
```

You can also do the same thing with the docker run command, using the [`--env`](https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file) flag.
If you've got many environmental variables, you might find it useful to put them in a [`.env` file](https://docs.docker.com/compose/env-file/). Similarly, for Docker run you can use [`--env-file`](https://docs.docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file) if you'd like to pass in a file containing all your environmental variables.

**[⬆️ Back to Top](#management)**

---

## Setting Headers

Any external requests made to a different origin (app/ service under a different domain) will be blocked if the correct headers are not specified. This is known as [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) (CORS) and is a security feature built into modern browsers.

If you see a CORS error in your console, this can be easily fixed by setting the correct headers. This is not a bug with Dashy, so please don't raise it as a bug!

### Example Headers

- [Caddy](#caddy)
- [NGINX](#nginx)
- [Træfɪk](#traefik)
- [HAProxy](#haproxy)
- [Apache](#apache)

_The following section briefly outlines how you can set headers for common web proxies/ servers. More info can be found in the documentation for the proxy that you are using, or in the [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)._

These examples are using:

- `Access-Control-Allow-Origin` header, but depending on what type of content you are enabling, this will vary. For example, to allow a site to be loaded in an iframe (for the modal or workspace views) you would use `X-Frame-Options`.
- The domain root (`/`), if your're hosting from a sub-page, replace that with your path.
- A wildcard (`*`), which would allow access from traffic on any domain, this is discouraged, and you should replace it with the URL where you are hosting Dashy. Note that for requests that transport sensitive info, like credentials (e.g. Keycloak login), the wildcard is [disallowed all together](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#requests_with_credentials) and will be blocked.

#### Caddy

> See [Caddy `header` docs](https://caddyserver.com/docs/caddyfile/directives/header) for more info.

```text
headers / {
  Access-Control-Allow-Origin *
}
```

#### NGINX

> See [NGINX `ngx_http_headers_module` docs](https://nginx.org/en/docs/http/ngx_http_headers_module.html) for more info.

```text
location / {
  add_header Access-Control-Allow-Origin *;
}
```

Note this can also be done through the UI, using NGINX Proxy Manager.

#### Traefik

> See [Træfɪk CORS headers docs](https://doc.traefik.io/traefik/middlewares/http/headers/#cors-headers) for more info.

```text
labels:
  - "traefik.http.middlewares.testheader.headers.accesscontrolallowmethods=GET,OPTIONS,PUT"
  - "traefik.http.middlewares.testheader.headers.accesscontrolalloworiginlist=https://foo.bar.org,https://example.org"
  - "traefik.http.middlewares.testheader.headers.accesscontrolmaxage=100"
  - "traefik.http.middlewares.testheader.headers.addvaryheader=true"
```

#### HAProxy

> See [HAProxy Rewrite Response Docs](https://www.haproxy.com/documentation/hapee/latest/traffic-routing/rewrites/rewrite-responses/) for more info.

```text
/
   http-response add-header Access-Control-Allow-Origin *
```

#### Apache

> See [Apache `mode_headers` docs](https://httpd.apache.org/docs/current/mod/mod_headers.html) for more info.

```text
Header always set Access-Control-Allow-Origin "*"
```

#### Squid

> See [Squid `request_header_access` docs](http://www2.gr.squid-cache.org/Doc/config/request_header_access/) for more info.

```text
request_header_access Authorization allow all
```

**[⬆️ Back to Top](#management)**

---

## Remote Access

- [WireGuard](#wireguard)
- [Reverse SSH Tunnel](#reverse-ssh-tunnel)
- [TCP Tunnel](#tcp-tunnel)

### WireGuard

Using a VPN is one of the easiest ways to provide secure, full access to your local network from remote locations. [WireGuard](https://www.wireguard.com/) is a reasonably new open source VPN protocol, that was designed with ease of use, performance and security in mind. Unlike OpenVPN, it doesn't need to recreate the tunnel whenever connection is dropped, and it's also much easier to setup, using shared keys instead.

- **Install Wireguard** - See the [Install Docs](https://www.wireguard.com/install/) for download links + instructions
  - On Debian-based systems, it's `sudo apt install wireguard`
- **Generate a Private Key** - Run `wg genkey` on the Wireguard server, and copy it to somewhere safe for later
- **Create Server Config** - Open or create a file at `/etc/wireguard/wg0.conf` and under `[Interface]` add the following (see example below):
  - `Address` - as a subnet of all desired IPs
  - `PrivateKey` - that you just generated
  - `ListenPort` - Default is `51820`, but can be anything
- **Get Client App** - Download the [WG client app](https://www.wireguard.com/install/) for your platform (Linux, Windows, MacOS, Android or iOS are all supported)
- **Create new Client Tunnel** - On your client app, there should be an option to create a new tunnel, when doing so a client private key will be generated (but if not, use the `wg genkey` command again), and keep it somewhere safe. A public key will also be generated, and this will go in our saver config
- **Add Clients to Server Config** - Head back to your `wg0.conf` file on the server, create a `[Peer]` section, and populate the following info
  - `AllowedIPs` - List of IP address inside the subnet, the client should have access to
  - `PublicKey` - The public key for the client you just generated
- **Start the Server** - You can now start the WG server, using: `wg-quick up wg0` on your server
- **Finish Client Setup** - Head back to your client device, and edit the config file, leave the private key as is, and add the following fields:
  - `PublicKey` - The public key of the server
  - `Address` - This should match the `AllowedIPs` section on the servers config file
  - `DNS` - The DNS server that'll be used when accessing the network through the VPN
  - `Endpoint` - The hostname or IP + Port where your WG server is running (you may need to forward this in your firewall's settings)
- **Done** - Your clients should now be able to connect to your WG server :) Depending on your networks firewall rules, you may need to port forward the address of your WG server

#### **Example Server Config**

```ini
# Server file
[Interface]
# Which networks does my interface belong to? Notice: /24 and /64
Address = 10.5.0.1/24, 2001:470:xxxx:xxxx::1/64
PrivateKey = xxx
ListenPort = 51820

# Peer 1
[Peer]
PublicKey = xxx
# Which source IPs can I expect from that peer? Notice: /32 and /128
AllowedIps = 10.5.0.35/32, 2001:470:xxxx:xxxx::746f:786f/128

# Peer 2
[Peer]
PublicKey = xxx
# Which source IPs can I expect from that peer? This one has a LAN which can
# access hosts/jails without NAT.
# Peer 2 has a single IP address inside the VPN: it's 10.5.0.25/32
AllowedIps = 10.5.0.25/32,10.21.10.0/24,10.21.20.0/24,10.21.30.0/24,10.31.0.0/24,2001:470:xxxx:xxxx::ca:571e/128
```

#### **Example Client Config**

```ini
[Interface]
# Which networks does my interface belong to? Notice: /24 and /64
Address = 10.5.0.35/24, 2001:470:xxxx:xxxx::746f:786f/64
PrivateKey = xxx

# Server
[Peer]
PublicKey = xxx
# I want to route everything through the server, both IPv4 and IPv6. All IPs are
# thus available through the Server, and I can expect packets from any IP to
# come from that peer.
AllowedIPs = 0.0.0.0/0, ::0/0
# Where is the server on the internet? This is a public address. The port
# (:51820) is the same as ListenPort in the [Interface] of the Server file above
Endpoint = 1.2.3.4:51820
# Usually, clients are behind NAT. to keep the connection running, keep alive.
PersistentKeepalive = 15
```

A useful tool for getting WG setup is [Algo](https://github.com/trailofbits/algo). It includes scripts and docs which cover almost all devices, platforms and clients, and has best practices implemented, and security features enabled. All of this is better explained in [this blog post](https://blog.trailofbits.com/2016/12/12/meet-algo-the-vpn-that-works/).

### Reverse SSH Tunnel

SSH (or [Secure Shell](https://en.wikipedia.org/wiki/Secure_Shell)) is a secure tunnel that allows you to connect to a remote host. Unlike the VPN methods, an SSH connection does not require an intermediary, and will not be affected by your IP changing. However it only allows you to access a single service at a time. SSH was really designed for terminal access, but because of the latter mentioned benefits it's useful to setup, as a fallback option.

Directly SSH'ing into your home, would require you to open a port (usually 22), which would be terrible for security, and is not recommended. However a reverse SSH connection is initiated from inside your network. Once the connection is established, the port is redirected, allowing you to use the established connection to SSH into your home network.

The issue you've probably spotted, is that most public, corporate, and institutional networks will block SSH connections. To overcome this, you'd have to establish a server outside of your homelab that your homelab's device could SSH into to establish the reverse SSH connection. You can then connect to that remote server (the _mothership_), which in turn connects to your home network.

Now all of this is starting to sound like quite a lot of work, but this is where services like [remot3.it](https://remote.it/) come in. They maintain the intermediary mothership server, and create the tunnel service for you. It's free for personal use, secure and easy. There are several similar services, such as [RemoteIoT](https://remoteiot.com/), or you could create your own on a cloud VPS (see [this tutorial](https://gist.github.com/nileshtrivedi/4c615e8d3c1bf053b0d31176b9e69e42) for more info on that).

Before getting started, you'll need to head over to [Remote.it](https://app.remote.it/auth/#/sign-up) and create an account.

Then setup your local device:

1. If you haven't already done so, you'll need to enable and configure SSH.
	- This is out-of-scope of this article, but I've explained it in detail in [this post](https://notes.aliciasykes.com/22798/my-server-setup#configure-ssh).
2. Download the Remote.it install script from their [GitHub](https://github.com/remoteit/installer)
	- `curl -LkO https://raw.githubusercontent.com/remoteit/installer/master/scripts/auto-install.sh`
3. Make it executable, with `chmod +x ./auto-install.sh`, and then run it with `sudo ./auto-install.sh`
4. Finally, configure your device, by running `sudo connectd_installer` and following the on-screen instructions

And when you're ready to connect to it:

1. Login to [app.remote.it](https://app.remote.it/), and select the name of your device
2. You should see a list of running services, click SSH
3. You'll then be presented with some SSH credentials that you can now use to securely connect to your home, via the Remote.it servers

Done :)

### TCP Tunnel

If you're running Dashy on your local network, behind a firewall, but need to temporarily share it with someone external, this can be achieved quickly and securely using [Ngrok](https://ngrok.com/). It's basically a super slick, encrypted TCP tunnel that provides an internet-accessible address that anyone use to access your local service, from anywhere.

To get started, [Download](https://ngrok.com/download) and install Ngrok for your system, then just run `ngrok http [port]` (replace the port with the http port where Dashy is running, e.g. 8080). When [using https](https://ngrok.com/docs#http-local-https), specify the full local url/ ip including the protocol.

Some Ngrok features require you to be authenticated, you can [create a free account](https://dashboard.ngrok.com/signup) and generate a token in [your dashboard](https://dashboard.ngrok.com/auth/your-authtoken), then run `ngrok authtoken [token]`.

It's recommended to use authentication for any publicly accessible service. Dashy has an [Auth](/docs/authentication.md) feature built in, but an even easier method it to use the [`-auth`](https://ngrok.com/docs#http-auth) switch. E.g. `ngrok http -auth="username:password123" 8080`

By default, your web app is assigned a randomly generated ngrok domain, but you can also use your own custom domain. Under the [Domains Tab](https://dashboard.ngrok.com/endpoints/domains) of your Ngrok dashboard, add your domain, and follow the CNAME instructions. You can now use your domain, with the [`-hostname`](https://ngrok.com/docs#http-custom-domains) switch, e.g. `ngrok http -region=us -hostname=dashy.example.com 8080`. If you don't have your own domain name, you can instead use a custom sub-domain (e.g. `alicia-dashy.ngrok.io`), using the [`-subdomain`](https://ngrok.com/docs#custom-subdomain-names) switch.

To integrate this into your docker-compose, take a look at the [gtriggiano/ngrok-tunnel](https://github.com/gtriggiano/ngrok-tunnel) container.

There's so much more you can do with Ngrok, such as exposing a directory as a file browser, using websockets, relaying requests, rewriting headers, inspecting traffic, TLS and TCP tunnels and lots more. All or which is explained in [the Documentation](https://ngrok.com/docs).

It's worth noting that Ngrok isn't the only option here, other options include: [FRP](https://github.com/fatedier/frp), [Inlets](https://inlets.dev), [Local Tunnel](https://localtunnel.me/), [TailScale](https://tailscale.com/), etc. Check out [Awesome Tunneling](https://github.com/anderspitman/awesome-tunneling) for a list of alternatives.

**[⬆️ Back to Top](#management)**

---

## Custom Domain

- [Using DNS](#using-dns)
- [Using NGINX](#using-nginx)

### Using DNS

For locally running services, a domain can be set up directly in the DNS records. This method is really quick and easy, and doesn't require you to purchase an actual domain. Just update your networks DNS resolver, to point your desired URL to the local IP where Dashy (or any other app) is running. For example, a line in your hosts file might look something like: `192.168.0.2 dashy.homelab.local`.

If you're using Pi-Hole, a similar thing can be done in the `/etc/dnsmasq.d/03-custom-dns.conf` file, add a line like: `address=/dashy.example.com/192.168.2.0` for each of your services.

If you're running OPNSense/ PfSense, then this can be done through the UI with Unbound, it's explained nicely in [this article](https://homenetworkguy.com/how-to/use-custom-domain-name-in-internal-network/), by Dustin Casto.

### Using NGINX

If you're using NGINX, then you can use your own domain name, with a config similar to the below example.

```text
upstream dashy {
  server 127.0.0.1:32400;
}

server {
  listen         8080;
  server_name    dashy.mydomain.com;

  # Setup SSL
  ssl_certificate             /var/www/mydomain/sslcert.pem;
  ssl_certificate_key         /var/www/mydomain/sslkey.pem;
  ssl_protocols               TLSv1.2 TLSv1.3;
  ssl_ciphers                 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
  ssl_session_timeout         5m;
  ssl_prefer_server_ciphers   on;

  location / {
    proxy_pass                http://dashy;
    proxy_redirect            off;
    proxy_buffering           off;
    proxy_set_header          host              $host;
    proxy_set_header          X-Real-IP         $remote_addr;
    proxy_set_header          X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_next_upstream       error timeout     invalid_header http_500 http_502 http_503 http_504;
  }
}
```

Similarly, a basic `Caddyfile` might look like:

```text
dashy.example.com {
    reverse_proxy / nginx:8080
}
```

For more info, [this guide](https://thehomelab.wiki/books/dns-reverse-proxy/page/create-domain-records-to-point-to-your-home-server-on-cloudflare-using-nginx-progy-manager) on Setting up Domains with NGINX Proxy Manager and CloudFlare may be useful.

**[⬆️ Back to Top](#management)**

---

## Container Security

- [Keep Docker Up-To-Date](#keep-docker-up-to-date)
- [Set Resource Quotas](#set-resource-quotas)
- [Don't Run as Root](#dont-run-as-root)
- [Specify a User](#specify-a-user)
- [Limit Capabilities](#limit-capabilities)
- [Prevent new Privileges being Added](#prevent-new-privileges-being-added)
- [Disable Inter-Container Communication](#disable-inter-container-communication)
- [Don't Expose the Docker Daemon Socket](#dont-expose-the-docker-daemon-socket)
- [Use Read-Only Volumes](#use-read-only-volumes)
- [Set the Logging Level](#set-the-logging-level)
- [Verify Image before Pulling](#verify-image-before-pulling)
- [Specify the Tag](#specify-the-tag)
- [Container Security Scanning](#container-security-scanning)
- [Registry Security](#registry-security)
- [Security Modules](#security-modules)

### Keep Docker Up-To-Date

To prevent known container escape vulnerabilities, which typically end in escalating to root/administrator privileges, patching Docker Engine and Docker Machine is crucial. For more info, see the [Docker Installation Docs](https://docs.docker.com/engine/install/).

### Set Resource Quotas

Docker enables you to limit resource consumption (CPU, memory, disk) on a per-container basis. This not only enhances system performance, but also prevents a compromised container from consuming a large amount of resources, in order to disrupt service or perform malicious activities. To learn more, see the [Resource Constraints Docs](https://docs.docker.com/config/containers/resource_constraints/)

For example, to run Dashy with max of 1GB ram, and max of 50% of 1 CP core:
`docker run -d -p 8080:8080 --cpus=".5" --memory="1024m" lissy93/dashy:latest`

### Don't Run as Root

Running Docker commands with `sudo` gives the container more host-level access than it needs. You should run Docker as a non-root host user instead.

If you're facing permission issues on Debian-based systems when running Docker commands without `sudo`, you may need to add your user to the Docker group. First create the group: `sudo groupadd docker`,  then add your (non-root) user: `sudo usermod −aG docker [my-username]`, finally `newgrp docker` to refresh.

### Specify a User

For containers in general, running as an unprivileged user is one of the best ways to prevent privilege escalation attacks. You can specify a user with the [`--user` param](https://docs.docker.com/engine/reference/run/#user), using the user ID (`UID`) from `id -u` and group ID (`GID`) from `id -g`.

**Note for Dashy:** If you use features that write to disk (saving config through the UI), the process needs write access to `/app/user-data/`. Since the default image creates these directories as root, running with `--user` will cause those features to fail with permission errors unless you also fix ownership of the mounted volumes. If you only use Dashy in read-only mode, running as a non-root user works fine:

`docker run --user 1000:1000 -p 8080:8080 lissy93/dashy`

Or with Docker Compose, using an environmental variable:

```yaml
services:
  dashy:
    image: lissy93/dashy
    user: ${CURRENT_UID}
    ports: [ 4000:8080 ]
```

And then to set the variable, and start the container, run: `CURRENT_UID=$(id -u):$(id -g) docker-compose up`

### Limit capabilities

Docker containers run with a subset of [Linux Kernal's Capabilities](https://man7.org/linux/man-pages/man7/capabilities.7.html) by default. It's good practice to drop privilege permissions that are not needed for any given container.

With Docker run, you can use the `--cap-drop` flag to remove capabilities, you can also use `--cap-drop=all` and then define just the required permissions using the `--cap-add` option. For a list of available capabilities, see the [Privilege Capabilities Docs](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities).

Note that dropping privileges and capabilities on runtime is not fool-proof, and often any leftover privileges can be used to re-escalate, see [POS36-C](https://wiki.sei.cmu.edu/confluence/display/c/POS36-C.+Observe+correct+revocation+order+while+relinquishing+privileges).

Here's an example using docker-compose, removing privileges that are not required for Dashy to run:

```yaml
services:
  dashy:
    image: lissy93/dashy
    ports: [ 4000:8080 ]
    cap_drop:
    - ALL
    cap_add:
    - CHOWN
    - SETGID
    - SETUID
    - DAC_OVERRIDE
    - NET_BIND_SERVICE
```

### Prevent new Privileges being Added

To prevent processes inside the container from getting additional privileges, pass in the `--security-opt=no-new-privileges:true` option to the Docker run command (see [docs](https://docs.docker.com/engine/reference/run/#security-configuration)).

Run Command:
`docker run --security-opt=no-new-privileges:true -p 8080:8080 lissy93/dashy`

Docker Compose

```yaml
security_opt:
- no-new-privileges:true
```

### Disable Inter-Container Communication

By default Docker containers can talk to each other (using [`docker0` bridged network](https://docs.docker.com/config/containers/container-networking/)). If you don't need this capability, then it should be disabled. This can be done with the `--icc=false` in your run command. You can learn more about how to facilitate secure communication between containers in the [Compose Networking docs](https://docs.docker.com/compose/networking/).

### Don't Expose the Docker Daemon Socket

Docker socket `/var/run/docker.sock` is the UNIX socket that Docker is listening to. This is the primary entry point for the Docker API. The owner of this socket is root. Giving someone access to it is equivalent to giving unrestricted root access to your host.

You should **not** enable TCP Docker daemon socket (`-H tcp://0.0.0.0:XXX`), as doing so exposes un-encrypted and unauthenticated direct access to the Docker daemon, and if the host is connected to the internet, the daemon on your computer can be used by anyone from the public internet- which is bad. If you need TCP, you should [see the docs](https://docs.docker.com/engine/reference/commandline/dockerd/#daemon-socket-option) to understand how to do this more securely.
Similarly, never expose `/var/run/docker.sock` to other containers as a volume, as it can be exploited.

### Use Read-Only Volumes

You can specify that a volume should be read-only by appending `:ro` to the `-v` switch. If you don't need the in-app config editor, mount your `user-data` read-only:

```bash
docker run -d \
  -p 8080:8080 \
  -v ~/dashy-data:/app/user-data:ro \
  lissy93/dashy:latest
```

If you do want config changes from the UI to persist back to disk, leave the mount writable. You can also use `--read-only` to make the whole container filesystem read-only, but in that case UI-driven config edits will not be saved.

### Set the Logging Level

Logging is important, as it enables you to review events in the future, and in the case of a compromise this will let get an idea of what may have happened. The default log level is `INFO`, and this is also the recommendation, use `--log-level info` to ensure this is set.

### Verify Image before Pulling

Only use trusted images, from verified/ official sources. If an app is open source, it is more likely to be safe, as anyone can verify the code. There are also tools available for scanning containers,

Unless otherwise configured, containers can communicate among each other, so running one bad image may lead to other areas of your setup being compromised. Docker images typically contain both original code, as well as up-stream packages, and even if that image has come from a trusted source, the up-stream packages it includes may not have.

### Specify the Tag

Using fixed tags (as opposed to `:latest` ) will ensure immutability, meaning the base image will not change between builds. Note that for Dashy, the app is being actively developed, new features, bug fixes and general improvements are merged each week, and if you use a fixed version you will not enjoy these benefits. So it's up to you weather you would prefer a stable and reproducible environment, or the latest features and enhancements.

### Container Security Scanning

It's helpful to be aware of any potential security issues in any of the Docker images you are using. You can run a quick scan using Snyk on any image to output known vulnerabilities using [Docker scan](https://docs.docker.com/engine/scan/), e.g: `docker scan lissy93/dashy:latest`.

A similar product is [Trivy](https://github.com/aquasecurity/trivy), which is free an open source. First install it (with your package manager), then to scan an image, just run: `trivy image lissy93/dashy:latest`

For larger systems, RedHat [Clair](https://www.redhat.com/en/topics/containers/what-is-clair) is an app for parsing image contents and reporting on any found vulnerabilities. You run it locally in a container, and configure it with YAML. It can be integrated with Red Hat Quay, to show results on a dashboard. Most of these use static analysis to find potential issues, and scan included packages for any known security vulnerabilities.

### Registry Security

Although over-kill for most users, you could run your own registry locally which would give you ultimate control over all images, see the [Deploying a Registry Docs](https://docs.docker.com/registry/deploying/) for more info. Another option is [Docker Trusted Registry](https://docker-docs.netlify.app/ee/dtr/), it's great for enterprise applications, it sits behind your firewall, running on a swarm managed by Docker Universal Control Plane, and lets you securely store and manage your Docker images, mitigating the risk of breaches from the internet.

### Security Modules

Docker supports several modules that let you write your own security profiles.

[AppArmor](https://www.apparmor.net/)is a kernel module that proactively protects the operating system and applications from external or internal threats, by enabling you to  restrict programs' capabilities with per-program profiles. You can specify either a security policy by name, or by file path with the `apparmor` flag in docker run. Learn more about writing profiles, [here](https://gitlab.com/apparmor/apparmor/-/wikis/QuickProfileLanguage).

[Seccomp](https://en.wikipedia.org/wiki/Seccomp) (Secure Computing Mode) is a sandboxing facility in the Linux kernel that acts like a firewall for system calls (syscalls). It uses Berkeley Packet Filter (BPF) rules to filter syscalls and control how they are handled. These filters can significantly limit a containers access to the Docker Host's Linux kernel - especially for simple containers/applications. It requires a Linux-based Docker host, with secomp enabled, and you can check for this by running `docker info | grep seccomp`. A great resource for learning more about this is [DockerLabs](https://training.play-with-docker.com/security-seccomp/).

**[⬆️ Back to Top](#management)**

---

## Web Server Configuration

> _The following section only applies if you are not using Docker, and would like to use your own web server_

Dashy ships with a pre-configured Node.js server, in [`server.js`](https://github.com/Lissy93/dashy/blob/master/server.js) which serves up the contents of the `./dist` directory on a given port. You can start the server by running `node server`. Note that the app must have been build (run `yarn build`), and you need [Node.js](https://nodejs.org) installed.

If you wish to run Dashy from a sub page (e.g. `example.com/dashy`), then just set the `BASE_URL` environmental variable to that page name (in this example, `/dashy`), before building the app, and the path to all assets will then resolve to the new path, instead of `./`.

However, since Dashy is just a static web application, it can be served with whatever server you like. The following section outlines how you can configure a web server.

Note, that if you choose not to use `server.js` to serve up the app, you will loose access to the following features:

- Loading page, while the app is building
- Writing config file to disk from the UI
- Website status indicators, and ping checks

Example Configs

- [NGINX](#nginx)
- [Apache](#apache)
- [Caddy](#caddy)
- [Firebase](#firebase-hosting)
- [cPanel](#cpanel)

### NGINX

Create a new file in `/etc/nginx/sites-enabled/dashy`

```text
server {
	listen 8080;
	listen [::]:8080;

	root /var/www/dashy/html;
	index index.html;

	server_name your-domain.com www.your-domain.com;

	location / {
		try_files $uri $uri/ =404;
	}
}
```

To use HTML5 history mode (the default - controlled via the `VITE_APP_ROUTING_MODE` build-time env var), replace the inside of the location block with: `try_files $uri $uri/ /index.html;`.

Then upload the build contents of Dashy's dist directory to that location.
For example: `scp -r ./dist/* [username]@[server_ip]:/var/www/dashy/html`

### Apache

Copy Dashy's dist folder to your apache server, `sudo cp -r ./dashy/dist /var/www/html/dashy`.

In your Apache config, `/etc/apche2/apache2.conf` add:

```text
<Directory /var/www/html>
	Options Indexes FollowSymLinks
	AllowOverride All
	Require all granted
</Directory>

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

Add a `.htaccess` file within `/var/www/html/dashy/.htaccess`, and add:

```text
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

Then restart Apache, with `sudo systemctl restart apache2`

### Caddy

Caddy v2

```text
try_files {path} /
```

Caddy v1

```text
rewrite {
  regexp .*
  to {path} /
}
```

### Firebase Hosting

Create a file names `firebase.json`, and populate it with something similar to:

```text
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### cPanel

1. Login to your WHM
2. Open 'Feature Manager' on the left sidebar
3. Under 'Manage feature list', click 'Edit'
4. Find 'Application manager' in the list, enable it and hit 'Save'
5. Log into your users cPanel account, and under 'Software' find 'Application Manager'
6. Click 'Register Application', fill in the form using the path that Dashy is located, and choose a domain, and hit 'Save'
7. The application should now show up in the list, click 'Ensure dependencies', and move the toggle switch to 'Enabled'
8. If you need to change the port, click 'Add environmental variable', give it the name 'PORT', choose a port number and press 'Save'.
9. Dashy should now be running at your selected path an on a given port

**[⬆️ Back to Top](#management)**

---

## Running a Modified Version of the App

If you'd like to make any code changes to the app, and deploy your modified version, this section briefly explains how.

The first step is to fork the project on GitHub, and clone it to your local system. Next, install the dependencies (`yarn`), and start the development server (`yarn dev`) and visit `localhost:8080` in your browser. You can then make changes to the codebase, and see the live app update in real-time. Once you've finished, running `yarn build` will build the app for production, and output the assets into `./dist` which can then be deployed using a web server, CDN or the built-in Node server with `yarn start`. For more info on all of this, take a look at the [Developing Docs](/docs/developing.md). To build your own Docker container from the modified app, see [Building your Own Container](#building-your-own-container)

**[⬆️ Back to Top](#management)**

---

## Building your Own Container

Similar to above, you'll first need to fork and clone Dashy to your local system, and then install dependencies.

Then, either use Dashy's default [`Dockerfile`](https://github.com/Lissy93/dashy/blob/master/Dockerfile) as is, or modify it according to your needs.

To build and deploy locally, first build the app with: `docker build -t dashy .`, and then start the app with `docker run -p 8080:8080 --name my-dashboard dashy`.  Or modify the `docker-compose.yml` file, replacing `image: lissy93/dashy` with `build: .` and run `docker compose up`.

Your container should now be running, and will appear in the list when you run `docker container ls –a`. If you'd like to enter the container, run `docker exec -it [container-id] /bin/ash`.

You may wish to upload your image to a container registry for easier access. Note that if you choose to do this on a public registry, please name your container something other than just 'dashy', to avoid confusion with the official image.
You can push your build image, by running: `docker push ghcr.io/OWNER/IMAGE_NAME:latest`. You will first need to authenticate, this can be done by running `echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin`, where `CR_PAT` is an environmental variable containing a token generated from your GitHub account. For more info, see the [Container Registry Docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).

**[⬆️ Back to Top](#management)**

---
