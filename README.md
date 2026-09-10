# McKay's Garage Website

Cloudflare Pages rebuild of mckaysgarage.com with a focus on preserving the current McKay's Garage look while improving local SEO, content depth, performance, accessibility, and form delivery.

## Cloudflare Pages

- Framework preset: **None**
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: repository root
- Production branch: `main`
- Node: 20+

Cloudflare Pages Functions are in `functions/` and deploy with the site.

## Required Cloudflare environment variable

- `RESEND_API_KEY` — Resend API key with `mckaysgarage.com` verified as a sending domain.

## Optional Cloudflare environment variables

- `CONTACT_FROM_EMAIL` — defaults to `McKay's Garage <forms@mckaysgarage.com>`
- `CONTACT_TO_EMAIL` — defaults to `bmckay1@mckaysgarage.com`
- `SITE_URL` — defaults to `https://www.mckaysgarage.com`
- `TURNSTILE_SECRET_KEY` — enables server-side Turnstile verification when configured
- `TURNSTILE_SITE_KEY` — exposes the site key to the form when configured

## Forms

Appointment/contact submissions POST to `/api/contact`. Resend sends:

1. A branded lead email to Bobby.
2. A branded confirmation email to the customer with a copy of the request.

The form includes server-side validation, a honeypot, and optional Cloudflare Turnstile support.

## Blog publishing

Blog source content lives in `content/posts.json`. `npm run build` publishes only posts whose `publishDate` is today or earlier in `America/Denver`.

Four new posts are live in the initial launch set. Four additional posts are dated weekly for automatic publication. The GitHub Actions workflow in `.github/workflows/scheduled-blog-publish.yml` creates a small daily trigger commit only when a scheduled post becomes due, causing Cloudflare Pages to rebuild and publish it.

## SEO included

- Canonical URLs
- Unique titles and meta descriptions
- Open Graph/Twitter metadata
- `AutoRepair` / `LocalBusiness`, `Service`, `BreadcrumbList`, and article structured data
- XML sitemap generated at build time
- robots.txt
- legacy Squarespace URL redirects
- semantic heading hierarchy and internal links
- local service-area content for Longmont and nearby Northern Colorado communities
- accessible forms and mobile navigation
- performance/security headers

## Current Squarespace media

The first build intentionally references several existing Squarespace-hosted photographs so the visual character stays close to the current site during migration. Before canceling Squarespace, migrate those photographs into this repository or Cloudflare R2 and replace the CDN URLs so the new site has no Squarespace media dependency.
