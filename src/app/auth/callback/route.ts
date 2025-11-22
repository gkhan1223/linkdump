// src/app/auth/callback/route.ts

import { createClient } from '@/lib/supabase/route';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient();

    await supabase.auth.exchangeCodeForSession(code);

    // 사용자 프로필 조회
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id as any)
        .single();

      // 역할에 따라 리다이렉트
      if ((profile as any)?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } else if ((profile as any)?.role === 'instructor') {
        return NextResponse.redirect(new URL('/instructor/dashboard', request.url));
      }
    }
  }

  // 기본 리다이렉트
  return NextResponse.redirect(new URL('/login', request.url));
}
