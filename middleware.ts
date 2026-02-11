import { NextRequest, NextResponse } from 'next/server';

const LOCALE_COOKIE = 'NEXT_LOCALE';

function prefersSpanish(acceptLanguage: string | null): boolean {
  if (!acceptLanguage) return false;
  const parts = acceptLanguage.split(',').map((s) => s.trim().split(';')[0].toLowerCase());
  const first = parts[0]?.split('-')[0];
  return first === 'es';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname !== '/') {
    return NextResponse.next();
  }

  const localeCookie = request.cookies.get(LOCALE_COOKIE)?.value;

  if (localeCookie === 'es') {
    const url = request.nextUrl.clone();
    url.pathname = '/es';
    const res = NextResponse.redirect(url);
    res.cookies.set(LOCALE_COOKIE, 'es', { path: '/', maxAge: 60 * 60 * 24 * 365 });
    return res;
  }

  if (localeCookie === 'en') {
    const res = NextResponse.next();
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

  const res = NextResponse.next();
  res.cookies.set(LOCALE_COOKIE, 'en', { path: '/', maxAge: 60 * 60 * 24 * 365 });
  return res;
}

export const config = {
  matcher: '/',
};
