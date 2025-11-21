// src/lib/supabase/client.ts

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

/**
 * 클라이언트 컴포넌트에서 사용하는 Supabase 클라이언트
 * 브라우저 환경에서 실행됨
 */
export const createClient = () => {
  return createClientComponentClient<Database>();
};
