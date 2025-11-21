// src/app/(instructor)/instructor/dashboard/page.tsx

'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';

export default function InstructorDashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="p-8">로딩 중...</div>;
  }

  if (!user || profile?.role !== 'instructor') {
    router.push('/login');
    return null;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">강사 대시보드</h1>
      <p className="mt-4">환영합니다, {profile.name || profile.email}님!</p>
      <p className="mt-2 text-sm text-gray-600">역할: {profile.role}</p>
      <button
        onClick={signOut}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        로그아웃
      </button>
    </div>
  );
}
