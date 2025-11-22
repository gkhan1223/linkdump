// src/lib/auth/auth-context.tsx

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // 프로필 조회 함수
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  };

  // 프로필 새로고침
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  // 로그아웃
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // 초기 세션 확인
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('[AuthContext] Initializing auth...');

      // 환경변수 확인
      console.log('[AuthContext] Environment check:', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      });

      try {
        console.log('[AuthContext] Calling getSession...');

        // 타임아웃 추가 (10초)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('getSession timeout after 10s')), 10000)
        );

        const sessionPromise = supabase.auth.getSession();

        const {
          data: { session },
        } = await Promise.race([sessionPromise, timeoutPromise]) as any;

        console.log('[AuthContext] getSession result:', session ? 'session exists' : 'no session');

        if (session?.user) {
          console.log('[AuthContext] User found, fetching profile...');
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
          console.log('[AuthContext] Profile loaded:', profileData?.role);
        }
      } catch (error) {
        console.error('[AuthContext] Error initializing auth:', error);
      } finally {
        console.log('[AuthContext] Setting loading to false');
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 인증 상태 변경 감지
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// useAuth 훅
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
