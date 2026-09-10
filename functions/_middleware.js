const ASSET_VERSION = '20260910-5';

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

  // Version the non-fingerprinted CSS/JS asset URLs so browsers do not keep
  // serving an older deployment from cache during this rebuild.
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
