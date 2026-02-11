import { NextRequest, NextResponse } from 'next/server';
import type { Locale } from '@/lib/i18n';

const LOCALE_COOKIE = 'NEXT_LOCALE';

function prefersSpanish(acceptLanguage: string | null): boolean {
  if (!acceptLanguage) return false;
  const parts = acceptLanguage.split(',').map((s) => s.trim().split(';')[0].toLowerCase());
  const first = parts[0]?.split('-')[0];
  return first === 'es';
}

/**
 * Derives the locale from the request path.
 * - Paths starting with /es → Spanish
 * - Everything else → English (default)
 */
function getLocaleFromPath(pathname: string): Locale {
  if (pathname.startsWith('/es')) return 'es';
  return 'en';
}

/** Returns NextResponse.next() with x-next-locale header for the root layout. */
function nextWithLocale(request: NextRequest, locale: Locale) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-next-locale', locale);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Accept-Language redirect only for root path
  if (pathname === '/') {
    const localeCookie = request.cookies.get(LOCALE_COOKIE)?.value;

    if (localeCookie === 'es') {
      const url = request.nextUrl.clone();
      url.pathname = '/es';
      const res = NextResponse.redirect(url);
      res.cookies.set(LOCALE_COOKIE, 'es', { path: '/', maxAge: 60 * 60 * 24 * 365 });
      return res;
    }

    if (localeCookie === 'en') {
      const res = nextWithLocale(request, 'en');
      res.cookies.set(LOCALE_COOKIE, 'en', { path: '/', maxAge: 60 * 60 * 24 * 365 });
      return res;
    }

    const acceptLanguage = request.headers.get('accept-language');
    if (prefersSpanish(acceptLanguage)) {
      const url = request.nextUrl.clone();
      url.pathname = '/es';
      const res = NextResponse.redirect(url);
      res.cookies.set(LOCALE_COOKIE, 'es', { path: '/', maxAge: 60 * 60 * 24 * 365 });
      return res;
    }

    const res = nextWithLocale(request, 'en');
    res.cookies.set(LOCALE_COOKIE, 'en', { path: '/', maxAge: 60 * 60 * 24 * 365 });
    return res;
  }

  // For all other paths, set locale header from path and continue
  const locale = getLocaleFromPath(pathname);
  return nextWithLocale(request, locale);
}

export const config = {
  // Run on page routes; skip static files, api routes, and _next
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
