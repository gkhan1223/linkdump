import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <AdminHeader />

      <div className="flex">
        {/* 사이드바 (Desktop) */}
        <AdminSidebar />

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-6 lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}
