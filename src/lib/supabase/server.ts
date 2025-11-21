// src/lib/supabase/server.ts

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/**
 * 서버 컴포넌트에서 사용하는 Supabase 클라이언트
 * 서버 환경에서 실행됨
 */
export const createClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
};
