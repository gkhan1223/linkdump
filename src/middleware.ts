// src/middleware.ts

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 인증이 필요한 경로
  const protectedPaths = ['/admin', '/instructor'];
  const isProtectedPath = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  // 인증되지 않은 사용자가 보호된 경로 접근 시 로그인 페이지로 리다이렉트
  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 역할 기반 접근 제어
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // Admin 전용 경로
    if (req.nextUrl.pathname.startsWith('/admin') && (profile as any)?.role !== 'admin') {
      return NextResponse.redirect(new URL('/instructor/dashboard', req.url));
    }

    // Instructor 전용 경로
    if (
      req.nextUrl.pathname.startsWith('/instructor') &&
      (profile as any)?.role !== 'instructor'
    ) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/instructor/:path*',
    '/api/:path*',
  ],
};
