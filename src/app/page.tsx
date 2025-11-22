'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

export default function Home() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (profile?.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (profile?.role === 'instructor') {
        router.push('/instructor/dashboard');
      }
    }
  }, [user, profile, loading, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-500">로딩 중...</div>
    </div>
  );
}
