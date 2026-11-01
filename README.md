<p align="center">
  <a href="https://courtgems.co.uk">
    <img src="site/assets/logo/court-gems-logo.png" alt="Court Gems" width="260">
  </a>
</p>

<p align="center">
  Website for Court Gems: tennis dampeners, overgrips and gift sets.
</p>

<p align="center">
  <a href="https://courtgems.co.uk"><strong>Live site</strong></a>
</p>

<p align="center">
  <img alt="Shopify headless" src="https://img.shields.io/badge/Shopify-Headless-2A1A7A?style=flat-square&logo=shopify&logoColor=white">
  <img alt="Deployed on Netlify" src="https://img.shields.io/badge/Deployed%20on-Netlify-2A1A7A?style=flat-square&logo=netlify&logoColor=white">
  <img alt="Designed with Claude Design" src="https://img.shields.io/badge/Design-Claude%20Design-8F7BE8?style=flat-square">
</p>

---

## What's here

```
site/          The website: static HTML/CSS/JS, published as-is by Netlify
netlify.toml   Netlify settings (publish site/, no build step)
```

Inside `site/`: `index.html` (home), `shop/`, `collections/`, `products/`, `guides/`,
`contact/`, `delivery/`, `returns/`, plus `styles.css`, `img/`, `assets/`, `fonts/`,
`sitemap.xml`, `robots.txt`, `llms.txt`, `google-feed.xml` and `_headers`.

## How changes flow

| Change | Made in | Reaches the site by |
|---|---|---|
| Website: pages, sections, copy, behaviour, images | `site/` | Pull request → Netlify preview → merge to `main` |
| Products, prices, stock, discounts, policies | **Shopify admin** | Live immediately, no deploy |

- Every push to `main` deploys to Netlify. Pull requests get a preview URL.
- No more drag-and-drop uploads: if you upload a zip by hand, the next push to `main` will overwrite it.

## Running locally

No build needed. From the repo root:

```bash
npx serve site
```

Then open the URL it prints. Cart and checkout talk to the live Shopify store.
