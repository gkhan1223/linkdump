// src/app/(instructor)/layout.tsx

import InstructorHeader from '@/components/layout/InstructorHeader';

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <InstructorHeader />

      {/* 메인 콘텐츠 (사이드바 없음) */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
