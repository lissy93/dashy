# Cloud Services

Dashy is intended to be run locally, within your LAN/homelab. But it can also be deployed to the cloud for certain use cases.

Where possible, I've included templates and 1-click install links, so you can deploy your own instance in under a minute.

> [!IMPORTANT]
> - It's your responsibility to secure your instance and set up access control
> - On pure static / CDN hosting, Dashy's server endpoints (like saving config through the UI) don't work
> - Links are unofficial unless otherwise stated, so we can't offer support for them

---

## VPS Hosting

### Hostinger

Deploy Dashy with a single click on Hostinger - pre-configured and ready to run.

<a href="https://www.hostg.xyz/aff_c?offer_id=48&aff_id=243972&url_id=6825"><img alt="Hostinger" src="https://assets.hostinger.com/vps/deploy.svg" height="32"></a>

Hostinger is kindly sponsoring another project of ours, [Web-Check](https://github.com/lissy93/web-check).
You can use [this link](https://www.hostg.xyz/aff_c?offer_id=48&aff_id=243972&url_id=6825) to get ~70% off a VPS of your choice. If you'd prefer a non-affiliate link, you can use this link: [https://www.hostinger.com/applications/dashy](https://www.hostinger.com/applications/dashy).

---

## Static Hosting Providers

### Netlify

[Netlify](https://www.netlify.com/) is static hosting with Git deploys. Click the button and Netlify uses the included [`netlify.toml`](https://github.com/Lissy93/dashy/blob/master/netlify.toml) to build and publish Dashy. Alternatively, fork the repo and import your fork into Netlify, so changes redeploy automatically. Your fork can be private if needed. Dashy's status checks and CORS proxy run as Netlify functions (wired up in `netlify.toml`), so those work here, though saving config through the UI still doesn't.

[![Deploy to Netlify](https://forthebadge.com/api/badges/generate?panels=2&primaryLabel=Deploy&secondaryLabel=Netlify&primaryBGColor=%23393939&primaryTextColor=%23FFFFFF&secondaryBGColor=%2300C7B7&secondaryIcon=netlify&borderRadius=2)](https://app.netlify.com/start/deploy?repository=https://github.com/lissy93/dashy)


### Vercel

[Vercel](https://vercel.com/) is static hosting with GitHub integration. Either click the button below, or fork and import the repo, and Vercel will build and deploy your own Dashy instance.

[![Deploy with Vercel](https://forthebadge.com/api/badges/generate?panels=2&primaryLabel=Deploy&secondaryLabel=Vercel&primaryBGColor=%23393939&primaryTextColor=%23FFFFFF&secondaryBGColor=%23000000&secondaryIcon=vercel&borderRadius=2)](https://vercel.com/new/clone?repository-url=https://github.com/lissy93/dashy)

### EdgeOne Pages

[EdgeOne Pages](https://pages.edgeone.ai) is static hosting on Tencent's edge. Click the button and import the repo; EdgeOne builds Dashy from Git.

[![Deploy to EdgeOne](https://forthebadge.com/api/badges/generate?panels=2&primaryLabel=Deploy&secondaryLabel=EdgeOne&primaryBGColor=%23393939&primaryTextColor=%23FFFFFF&secondaryBGColor=%230055D2&borderRadius=2)](https://edgeone.ai/pages/new?repository-url=https://github.com/lissy93/dashy)


### Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com/) is static hosting on Cloudflare's edge. Import the repo, set build command `yarn build`, and set output directory `dist`.


### Firebase Hosting

[Firebase Hosting](https://firebase.google.com/products/hosting) is static hosting on Google's CDN. Run `yarn build`, deploy `dist` with the Firebase CLI, and add an SPA rewrite to `index.html`.

### Azure Static Web Apps

[Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/) is static hosting with GitHub Actions. Create a Static Web App from the repo with app location `/`, build command `yarn build`, and output location `dist`.

---

## Container Runtimes

> [!NOTE]
> These run Dashy's Node server, so status checks and server endpoints work. Mount `/app/user-data` if config edits or uploaded assets should survive restarts.

### Render

[Render](https://render.com/) is managed container hosting. Click the button and Render uses the included [`render.yaml`](https://github.com/Lissy93/dashy/blob/master/render.yaml) to build Dashy. To persist `user-data`, uncomment the disk in that file, which requires a paid plan.


[![Deploy to Render](https://forthebadge.com/api/badges/generate?panels=2&primaryLabel=Deploy&secondaryLabel=Render&primaryBGColor=%23393939&primaryTextColor=%23FFFFFF&secondaryBGColor=%23000000&secondaryIcon=render&borderRadius=2)](https://render.com/deploy?repo=https://github.com/lissy93/dashy)


### Railway

[Railway](https://railway.com/) is managed container hosting. Click the button to deploy the Dashy template with `lissy93/dashy:latest` and a persistent `/app/user-data` volume.

[![Deploy on Railway](https://forthebadge.com/api/badges/generate?panels=2&primaryLabel=Deploy&secondaryLabel=Railway&primaryBGColor=%23393939&primaryTextColor=%23FFFFFF&secondaryBGColor=%230B0D0E&secondaryIcon=railway&borderRadius=2)](https://railway.com/deploy/dashy)



### Fly.io

[Fly.io](https://fly.io/) runs Docker apps on Fly Machines. Install [`flyctl`](https://fly.io/docs/flyctl/install/), log in, then run the following. If it asks you for the internal port, use `8080`

```bash
fly launch --from https://github.com/lissy93/dashy --no-deploy
fly deploy
```


### Koyeb

[Koyeb](https://www.koyeb.com/) is serverless container hosting. Click the button to deploy `lissy93/dashy:latest` from Docker Hub with HTTP port `8080`.

[![Deploy to Koyeb](https://forthebadge.com/api/badges/generate?panels=2&primaryLabel=Deploy&secondaryLabel=Koyeb&primaryBGColor=%23393939&primaryTextColor=%23FFFFFF&secondaryBGColor=%23121212&secondaryIcon=koyeb&borderRadius=2)](https://app.koyeb.com/deploy?type=docker&image=docker.io/lissy93/dashy:latest&name=dashy&ports=8080%3Bhttp%3B%2F)


### Northflank

[Northflank](https://northflank.com/) is managed container hosting. To get started, either follow [this guide](https://northflank.com/guides/deploy-dashy-with-northflank), or use the 1-click button below.

[![Deploy to Northflank](https://forthebadge.com/api/badges/generate?panels=2&primaryLabel=Deploy&secondaryLabel=Northflank&primaryBGColor=%23393939&primaryTextColor=%23FFFFFF&secondaryBGColor=%230093FF&borderRadius=2)](https://northflank.com/stacks/deploy-dashy)


### DigitalOcean App Platform

<!-- DigitalOcean's deploy button needs .do/deploy.template.yaml. Add that before enabling a button. -->

[DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform) is managed app hosting. Create an app from the public Docker image `lissy93/dashy:latest` and use HTTP port `8080`.

### Azure Container Apps

[Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/) is serverless container hosting on Azure. Deploy the public image with Azure CLI:

```bash
az containerapp up \
  --name dashy \
  --image docker.io/lissy93/dashy:latest \
  --ingress external \
  --target-port 8080
```

### Google Cloud Run

[Cloud Run](https://cloud.google.com/run) is serverless container hosting on Google Cloud. Click the button to open Cloud Shell and build Dashy from the repo's `Dockerfile`.

[![Run on Google Cloud](https://forthebadge.com/api/badges/generate?panels=2&primaryLabel=Deploy&secondaryLabel=Cloud%20Run&primaryBGColor=%23393939&primaryTextColor=%23FFFFFF&secondaryBGColor=%234285F4&secondaryIcon=googlecloud&borderRadius=2)](https://deploy.cloud.run/?git_repo=https://github.com/Lissy93/dashy)

---

## Managed Hosting

- [Elestio](https://elest.io/open-source/dashy) - Fully managed Dashy, or bring your own VM
- [PikaPods](https://www.pikapods.com/apps/) - Managed open-source app hosting; search for Dashy and click **Run Your Own**
- [Hostinger](https://www.hostinger.com/applications/dashy) - VPS hosting with a one-click Dashy Docker template
- [Podway](https://podway.io/start?app=dashy&ref=docs-dashy) - Dashy on your own small cloud machine, set up in one click; an AI admin checks for updates and upgrades with automatic rollback

---

## Hosting with any CDN

Once Dashy has been built, it is effectively just a static web app. This means that it can be served up with pretty much any static host, CDN or web server. To host Dashy through a CDN, the steps are very similar to building from source: clone the project, cd into it, install dependencies, write your config file and build the app. Once build is complete you will have a `./dist` directory within Dashy's root, and this is the build application which is ready to be served up.

However without Dashy's node server, there are a couple of features that will be unavailable to you, including: writing config changes to disk through the UI, and application status checks. Everything else will work fine.

---

## Other VPS

Dashy can be deployed to almost any VPS provider by following our [Docker](/docs/deployment/docker.md) guide.
