export async function onRequest(context) {
  const response = await context.next();
  const headers = new Headers(response.headers);
  const hostname = new URL(context.request.url).hostname.toLowerCase();

  // Keep Cloudflare's temporary preview hostname out of search results while
  // allowing the real mckaysgarage.com domain to be indexed after cutover.
  if (hostname.endsWith('.pages.dev')) {
    headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
