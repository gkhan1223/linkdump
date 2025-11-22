'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Course } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Trash2, Calendar } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function TrashPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [deletedCourses, setDeletedCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // 삭제된 과정 목록 조회
  const fetchDeletedCourses = async () => {
    try {
      setLoadingCourses(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_deleted', true)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      setDeletedCourses(data || []);
    } catch (error) {
      console.error('Error fetching deleted courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchDeletedCourses();
    }
  }, [user, profile]);

  // 복구
  const handleRestore = async (course: Course) => {
    if (!confirm(`"${course.client_name}" 과정을 복구하시겠습니까?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .update({
          is_deleted: false,
          deleted_at: null,
        })
        .eq('id', course.id);

      if (error) throw error;

      toast({ title: '성공', description: '과정이 복구되었습니다.' });
      fetchDeletedCourses();
    } catch (error: any) {
      console.error('Error restoring course:', error);
      toast({
        title: '오류',
        description: '과정 복구에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 영구 삭제
  const handlePermanentDelete = async (course: Course) => {
    if (
      !confirm(
        `"${course.client_name}" 과정을 영구적으로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase.from('courses').delete().eq('id', course.id);

      if (error) throw error;

      toast({ title: '성공', description: '과정이 영구 삭제되었습니다.' });
      fetchDeletedCourses();
    } catch (error: any) {
      console.error('Error permanently deleting course:', error);
      toast({
        title: '오류',
        description: '과정 영구 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  if (loading || loadingCourses) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    router.push('/login');
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">휴지통</h1>
        <p className="text-gray-500 mt-1">
          삭제된 과정은 15일 후 자동으로 영구 삭제됩니다.
        </p>
      </div>

      {deletedCourses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Trash2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">휴지통이 비어있습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deletedCourses.map((course) => {
            const daysUntilPermanentDelete = course.deleted_at
              ? 15 - differenceInDays(new Date(), new Date(course.deleted_at))
              : 0;

            return (
              <Card key={course.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {course.client_name}
                      </h3>
                      {daysUntilPermanentDelete <= 3 && (
                        <Badge variant="destructive">
                          {daysUntilPermanentDelete}일 후 영구 삭제
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <p>강사: {course.instructor_email}</p>
                      <p>
                        교육 날짜:{' '}
                        {format(new Date(course.education_date), 'yyyy년 M월 d일', {
                          locale: ko,
                        })}
                      </p>
                      {course.deleted_at && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>
                            삭제일:{' '}
                            {format(new Date(course.deleted_at), 'yyyy년 M월 d일', {
                              locale: ko,
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(course)}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      복구
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handlePermanentDelete(course)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      영구 삭제
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
