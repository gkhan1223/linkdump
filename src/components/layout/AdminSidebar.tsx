'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Trash2, Settings } from 'lucide-react';

const navItems = [
  {
    name: '대시보드',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: '휴지통',
    href: '/admin/trash',
    icon: Trash2,
  },
  {
    name: '설정',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:pt-16">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <nav className="flex flex-1 flex-col pt-6">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        'group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-5 w-5 shrink-0',
                          isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                        )}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
