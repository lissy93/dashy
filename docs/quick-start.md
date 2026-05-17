# Quick Start

Welcome to Dashy! So glad you're here 😊 In a couple of minutes, you'll have your new dashboard up and running 🚀

**TLDR;** Run `docker run -p 8080:8080 lissy93/dashy`, then open `http://localhost:8080`

---

## 1. Prerequisites

The quickest and easiest method of running Dashy is using Docker (or another container engine). You can find installation instructions for your system in the [Docker Documentation](https://docs.docker.com/get-docker/).
If you don't want to use Docker, then you can use one of Dashy's other supported installation methods instead, all of which are outlined in the [Deployment Docs](https://github.com/Lissy93/dashy/blob/master/docs/deployment.md).

---

## 2. Installation

To pull the latest image, and build and start the app run:

```bash
docker run -d \
  -p 8080:8080 \
  -v ~/dashy-data:/app/user-data \
  --name dashy \
  --restart=always \
  lissy93/dashy:latest
```

Your dashboard should now be up and running at `http://localhost:8080` (or your servers IP address/ domain, and the port that you chose) 🎉

Dashy is also available via GHCR (`ghcr.io/lissy93/dashy`).<br>
You can either use `:latest` or pin to specific versions (like `4.0.0`).<br>
All images are multi-arch (works on amd64, arm64, and arm/v7).<br>
To use with compose, see our sample [`docker-compose.yml`](https://github.com/lissy93/dashy/blob/master/docker-compose.yml).<br>
Once up and running, check the [configuring reference](https://dashy.to/docs/configuring) and [other docs](https://dashy.to/docs).<br>

> [!NOTE]
> You need to mount a directory for your Dashy settings in `/app/user-data`.
> The only required file here is the `conf.yml`, but this is also where you can put any other page configs and assets like images/icons, stylesheets, fonts, etc.
> Everything in this directory is served from Dashy's root (e.g. `/app/user-data/logo.png` will be accessible at `http://[dashy.local]/logo.png`).

---

## 3. User Data Directory

Your config file should be placed inside `user-data` (in Docker, that's `/app/user-data/`).

This directory can also contain some optional assets you wish to use within your dashboard, like icons, fonts, styles, scripts, etc.

Any files placed here will be served up to the root of the domain, and override the contents of `public/`.
For example, if you had `user-data/favicon.ico` this would be accessible at `http://my-dashy-instance.local/favicon.ico`

Example Files in `user-data`:
- `conf.yml` - This is the only file that is compulsory, it's your main Dashy config
- `**.yml` - Include more config files, if you'd like to have multiple pages, see [Multi-page support](/docs/pages-and-sections.md#multi-page-support) for docs
- `favicon.ico` - The default favicon, shown in the browser's tab title
- `initialization.html` - Static HTML page displayed before the app has finished compiling, see [`public/initialization.html`](https://github.com/Lissy93/dashy/blob/master/public/initialization.html)
- `robots.txt` - Search engine crawl rules, override this if you want your dashboard to be indexable
- `manifest.json` - PWA configuration file, for installing Dashy on mobile devices
- `index.html` - The main index page which initializes the client-side app, copy it from [`/public/index.html`](https://github.com/Lissy93/dashy/blob/master/public/index.html)
- `**.html` - Write your own HTML pages, and access them at `http://my-dashy-instance.local/my-page.html`
- `fonts/` - Custom fonts (be sure to include the ones already in [`public/fonts`](https://github.com/Lissy93/dashy/tree/master/public/fonts)
- `item-icons/` - To use your own icons for items on your dashboard, see [Icons --> Local Icons](/docs/icons.md#local-icons)
- `web-icons/` - Override Dashy logo
- `widget-resources/` - Fonts, icons and assets for custom widgets

---

## 4. Configure

Now that you've got Dashy running, you are going to want to set it up with your own content.
Config is written in [YAML Format](https://yaml.org/), and saved in [`/user-data/conf.yml`](https://github.com/Lissy93/dashy/blob/master/user-data/conf.yml).
The format on the config file is pretty straight forward. There are four root attributes:

- [`pageInfo`](https://github.com/Lissy93/dashy/blob/master/docs/configuring.md#pageinfo) - Dashboard meta data, like title, description, nav bar links and footer text
- [`appConfig`](https://github.com/Lissy93/dashy/blob/master/docs/configuring.md#appconfig-optional) - Dashboard settings, like themes, authentication, language and customization
- [`sections`](https://github.com/Lissy93/dashy/blob/master/docs/configuring.md#section) - An array of sections, each including an array of items
- [`pages`](https://github.com/Lissy93/dashy/blob/master/docs/configuring.md#pages-optional) - Have multiples pages in your dashboard

You can view a full list of all available config options in the [Configuring Docs](https://github.com/Lissy93/dashy/blob/master/docs/configuring.md).

```yaml
pageInfo:
  title: Home Lab
sections: # An array of sections
- name: Example Section
  icon: far fa-rocket
  items:
  - title: GitHub
    description: Dashy source code and docs
    icon: fab fa-github
    url: https://github.com/Lissy93/dashy
  - title: Issues
    description: View open issues, or raise a new one
    icon: fas fa-bug
    url: https://github.com/Lissy93/dashy/issues
- name: Local Services
  items:
  - title: Firewall
    icon: favicon
    url: http://192.168.1.1/
  - title: Game Server
    icon: https://i.ibb.co/710B3Yc/space-invader-x256.png
    url: http://192.168.130.1/
```

Notes:

- You can use a Docker volume to pass your `user-data` directory from the host into the container
  - E.g. `-v ./host-system/user-data:/app/user-data`
- It's also possible to edit your config directly through the UI, and changes will be saved in this file
- Check your config against Dashy's schema, with `docker exec -it [container-id] yarn validate-config`
- You might find it helpful to look at some examples, a collection of which can be [found here](https://gist.github.com/Lissy93/000f712a5ce98f212817d20bc16bab10)
- It's also possible to load a remote config, e.g. from a GitHub Gist

---

## 5. Further Customisation

Once you've got Dashy setup, you'll want to ensure the container is properly healthy, secured, backed up and kept up-to-date. All this is covered in the [Management Docs](https://github.com/Lissy93/dashy/blob/master/docs/management.md).

You might also want to check out the docs for specific features you'd like to use:

- [Authentication](/docs/authentication.md) - Setting up authentication to protect your dashboard
- [Alternate Views](/docs/alternate-views.md) - Using the startpage and workspace view
- [Backup & Restore](/docs/backup-restore.md) - Guide to Dashy's cloud sync feature
- [Icons](/docs/icons.md) - Outline of all available icon types for sections and items
- [Localisation](/docs/multi-language-support.md) - How to change language, or add your own
- [Status Indicators](/docs/status-indicators.md) - Using Dashy to monitor uptime and status of your apps/services and hosts
- [Search & Shortcuts](/docs/searching.md) - Using instant filter, web search and custom hotkeys
- [Theming](/docs/theming.md) - Complete guide to applying, writing and modifying themes and styles

---

## 6. Final Note

If you need any help or support in getting Dashy running, head over to the [Discussions](https://github.com/Lissy93/dashy/discussions) page. If you think you've found a bug, please do [raise it](https://github.com/Lissy93/dashy/issues/new/choose) so it can be fixed. For contact options, see the [Support Page](https://github.com/Lissy93/dashy/blob/master/.github/SUPPORT.md).

If you're enjoying Dashy, and have a few minutes to spare, please do take a moment to look at the [Contributing Page](https://github.com/Lissy93/dashy/blob/master/docs/contributing.md). Huge thanks to [everyone](https://github.com/Lissy93/dashy/blob/master/docs/credits.md) who has already helped out!

Enjoy your dashboard :)

---

## Alternative Deployment Method 1 - From Source

You can also easily run the app on your system without Docker. For this [Git](https://git-scm.com/downloads), [Node.js](https://nodejs.org/), and [Yarn](https://yarnpkg.com/) are required.

```bash
git clone https://github.com/Lissy93/dashy.git && cd dashy
yarn # Install dependencies
yarn build # Build the app
yarn start # Start the app
```

Then edit `./user-data/conf.yml`

---

## Alternative Deployment Method 2 - Netlify

Don't have a server? No problem! You can run Dashy for free on Netlify (as well as many [other cloud providers](./docs/deployment.md#deploy-to-cloud-service)). All you need it a GitHub account.

1. Fork Dashy's repository on GitHub
2. [Log in](app.netlify.com/login/) to Netlify with GitHub
3. Click "New site from Git" and select your forked repo, then click **Deploy**!
4. You can then edit the config in `./user-data/conf.yml` in your repo, and Netlify will rebuild the app

---

## Alternative Deployment Method 3 - Cloud Services

Dashy supports 1-Click deployments on several popular cloud platforms. To spin up a new instance, just click a link below:

- [<img src="https://i.ibb.co/ZxtzrP3/netlify.png" width="18"/> Deploy to Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/lissy93/dashy)
- [<img src="https://i.ibb.co/d2P1WZ7/heroku.png" width="18"/> Deploy to Heroku](https://heroku.com/deploy?template=https://github.com/Lissy93/dashy)
- [<img src="https://i.ibb.co/Ld2FZzb/vercel.png" width="18"/> Deploy to Vercel](https://vercel.com/new/project?template=https://github.com/lissy93/dashy)
- [<img src="https://i.ibb.co/xCHtzgh/render.png" width="18"/> Deploy to Render](https://render.com/deploy?repo=https://github.com/lissy93/dashy/tree/deploy_render)
- [<img src="https://i.ibb.co/J7MGymY/googlecloud.png" width="18"/> Deploy to GCP](https://deploy.cloud.run/?git_repo=https://github.com/lissy93/dashy.git)
- [<img src="https://i.ibb.co/HVWVYF7/docker.png" width="18"/> Deploy to PWD](https://labs.play-with-docker.com/?stack=https://raw.githubusercontent.com/Lissy93/dashy/master/docker-compose.yml)
- [<img src="https://i.ibb.co/7NxnM2P/easypanel.png" width="18"/> Deploy to Easypanel](https://easypanel.io/docs/templates/dashy)
