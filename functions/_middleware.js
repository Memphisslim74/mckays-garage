const ASSET_VERSION = '20260910-3';

export async function onRequest(context) {
  const response = await context.next();
  const headers = new Headers(response.headers);
  const hostname = new URL(context.request.url).hostname.toLowerCase();
  const contentType = headers.get('Content-Type') || '';

  // Keep Cloudflare's temporary preview hostname out of search results while
  // allowing the real mckaysgarage.com domain to be indexed after cutover.
  if (hostname.endsWith('.pages.dev')) {
    headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }

  // The first preview deployment used a 1-year immutable cache policy for
  // styles.css and site.js. Existing browsers can therefore keep showing the
  // original header and JavaScript even after newer deployments are live.
  // Version the two non-fingerprinted assets at the HTML edge so every visitor
  // gets the current CSS/JS without needing to clear browser cache manually.
  if (contentType.includes('text/html')) {
    const html = await response.text();
    const versionedHtml = html
      .replaceAll('/assets/styles.css"', `/assets/styles.css?v=${ASSET_VERSION}"`)
      .replaceAll('/assets/site.js"', `/assets/site.js?v=${ASSET_VERSION}"`);

    headers.set('Cache-Control', 'no-cache');
    return new Response(versionedHtml, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
