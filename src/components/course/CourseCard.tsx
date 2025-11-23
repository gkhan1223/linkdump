'use client';

import { Course } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Link as LinkIcon, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/auth-context';
import { useEffect, useState } from 'react';

interface CourseCardProps {
  course: Course;
  linkCount?: number;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  isInstructor?: boolean;
}

const statusConfig = {
  before: { label: '교육 전', className: 'bg-blue-100 text-blue-700' },
  ongoing: { label: '교육 중', className: 'bg-green-100 text-green-700' },
  completed: { label: '교육 완료', className: 'bg-gray-100 text-gray-500' },
};

export default function CourseCard({
  course,
  linkCount,
  onEdit,
  onDelete,
  isInstructor = false,
}: CourseCardProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const statusInfo = statusConfig[course.status];
  const isCompleted = course.status === 'completed';

  const [counts, setCounts] = useState<{
    admin: number;
    instructor: number;
    total: number;
  }>({ admin: 0, instructor: 0, total: 0 });

  // 링크 개수 조회
  useEffect(() => {
    const fetchLinkCount = async () => {
      const { data, error } = await supabase
        .from('links')
        .select('is_admin_created, created_by')
        .eq('course_id', course.id);

      if (error || !data) return;

      const adminLinks = data.filter((link) => link.is_admin_created).length;
      const instructorLinks = isInstructor
        ? data.filter((link) => !link.is_admin_created && link.created_by === user?.id).length
        : 0;

      setCounts({
        admin: adminLinks,
        instructor: instructorLinks,
        total: data.length,
      });
    };

    if (linkCount === undefined) {
      fetchLinkCount();
    } else {
      setCounts({ admin: 0, instructor: 0, total: linkCount });
    }
  }, [course.id, isInstructor, user?.id, linkCount, supabase]);

  const linkHref = isInstructor
    ? `/instructor/courses/${course.id}`
    : `/admin/courses/${course.id}`;

  return (
    <Link href={linkHref}>
      <Card
        className={cn(
          'p-4 hover:shadow-lg transition-all cursor-pointer group relative',
          isCompleted && 'opacity-60'
        )}
      >
        {/* 상태 배지 */}
        <Badge className={cn('mb-3', statusInfo.className)}>
          {statusInfo.label}
        </Badge>

        {/* 고객사명 */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
          {course.client_name}
        </h3>

        {/* 강사 정보 */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <User className="h-4 w-4" />
          <span className="truncate">{course.instructor_email}</span>
        </div>

        {/* 교육 날짜 */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <Calendar className="h-4 w-4" />
          <span>
            {format(new Date(course.education_date), 'yyyy년 M월 d일', {
              locale: ko,
            })}
          </span>
        </div>

        {/* 링크 개수 */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <LinkIcon className="h-4 w-4" />
          {isInstructor ? (
            <span>
              {counts.admin}+{counts.instructor}개
            </span>
          ) : (
            <span>{counts.total}개</span>
          )}
        </div>

        {/* 호버 시 표시되는 액션 버튼 */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          {onEdit && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 bg-white shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                onEdit(course);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 bg-white shadow-sm text-red-600 hover:text-red-700"
              onClick={(e) => {
                e.preventDefault();
                onDelete(course);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </Link>
  );
}
