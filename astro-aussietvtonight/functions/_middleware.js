/**
 * Aussie TV Tonight — Cloudflare Pages Middleware
 * Enforce canonical master domain: https://www.aussietvtonight.com/
 * Enforce trailing slash on HTML routes.
 */
const CANONICAL_HOST = 'www.aussietvtonight.com';
const REDIRECT_HOSTS = new Set([
  'aussietvtonight.com',
]);

export async function onRequest(context) {
  const url = new URL(context.request.url);

  // 1. Redirect apex domain to www.aussietvtonight.com (301 Permanent)
  if (REDIRECT_HOSTS.has(url.hostname)) {
    url.hostname = CANONICAL_HOST;
    url.protocol = 'https:';
    return Response.redirect(url.toString(), 301);
  }

  const { pathname } = url;

  // 2. Trailing slash enforcement for HTML routes
  if (
    pathname === '/' ||
    pathname.endsWith('/') ||
    pathname.includes('.') ||
    pathname.startsWith('/_astro/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/favicon/') ||
    pathname.startsWith('/og/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/cdn-cgi/')
  ) {
    return context.next();
  }

  url.pathname = `${pathname}/`;
  return Response.redirect(url.toString(), 301);
}
