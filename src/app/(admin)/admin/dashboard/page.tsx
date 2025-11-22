'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Course } from '@/types/database';
import CourseCard from '@/components/course/CourseCard';
import CourseFilter, { FilterState } from '@/components/course/CourseFilter';
import CourseModal from '@/components/course/CourseModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    sortBy: 'newest',
  });

  // 과정 목록 조회
  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchCourses();
    }
  }, [user, profile]);

  // 필터링 및 정렬
  useEffect(() => {
    let result = [...courses];

    // 검색 필터
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (course) =>
          course.client_name.toLowerCase().includes(searchLower) ||
          course.instructor_email.toLowerCase().includes(searchLower)
      );
    }

    // 상태 필터
    if (filters.status !== 'all') {
      result = result.filter((course) => course.status === filters.status);
    }

    // 정렬
    switch (filters.sortBy) {
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'date-asc':
        result.sort(
          (a, b) =>
            new Date(a.education_date).getTime() -
            new Date(b.education_date).getTime()
        );
        break;
      case 'date-desc':
        result.sort(
          (a, b) =>
            new Date(b.education_date).getTime() -
            new Date(a.education_date).getTime()
        );
        break;
      case 'client':
        result.sort((a, b) => a.client_name.localeCompare(b.client_name));
        break;
    }

    setFilteredCourses(result);
  }, [courses, filters]);

  // 과정 추가/수정
  const handleSubmitCourse = async (formData: any) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('인증되지 않은 사용자');

      // 강사 프로필 조회
      const { data: instructorProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.instructor_email)
        .eq('role', 'instructor')
        .single();

      if (!instructorProfile) {
        toast({
          title: '오류',
          description: '해당 이메일의 강사를 찾을 수 없습니다.',
          variant: 'destructive',
        });
        return;
      }

      // 진행 상황 자동 계산
      const educationDate = new Date(formData.education_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      educationDate.setHours(0, 0, 0, 0);

      let status: 'before' | 'ongoing' | 'completed';
      if (educationDate > today) {
        status = 'before';
      } else if (educationDate.getTime() === today.getTime()) {
        status = 'ongoing';
      } else {
        status = 'completed';
      }

      if (selectedCourse) {
        // 수정
        const { error } = await supabase
          .from('courses')
          .update({
            client_name: formData.client_name,
            instructor_id: instructorProfile.id,
            instructor_email: formData.instructor_email,
            education_date: formData.education_date,
            status,
            memo: formData.memo || null,
          })
          .eq('id', selectedCourse.id);

        if (error) throw error;

        toast({ title: '성공', description: '과정이 수정되었습니다.' });
      } else {
        // 추가
        const { error } = await supabase.from('courses').insert({
          client_name: formData.client_name,
          instructor_id: instructorProfile.id,
          instructor_email: formData.instructor_email,
          education_date: formData.education_date,
          status,
          memo: formData.memo || null,
          created_by: user.id,
        });

        if (error) throw error;

        toast({ title: '성공', description: '과정이 추가되었습니다.' });
      }

      fetchCourses();
    } catch (error: any) {
      console.error('Error submitting course:', error);
      toast({
        title: '오류',
        description: error.message || '과정 저장에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 과정 삭제 (소프트 삭제)
  const handleDeleteCourse = async (course: Course) => {
    if (!confirm(`"${course.client_name}" 과정을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq('id', course.id);

      if (error) throw error;

      toast({ title: '성공', description: '과정이 삭제되었습니다.' });
      fetchCourses();
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast({
        title: '오류',
        description: '과정 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 인증 체크
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
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">교육 과정 관리</h1>
          <p className="text-gray-500 mt-1">
            총 {filteredCourses.length}개의 과정
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => {
            setSelectedCourse(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          과정 추가
        </Button>
      </div>

      {/* 필터 */}
      <CourseFilter filters={filters} onFilterChange={setFilters} />

      {/* 과정 카드 그리드 */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">과정이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              linkCount={0}
              onEdit={(course) => {
                setSelectedCourse(course);
                setModalOpen(true);
              }}
              onDelete={handleDeleteCourse}
            />
          ))}
        </div>
      )}

      {/* 과정 추가/수정 모달 */}
      <CourseModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCourse(null);
        }}
        onSubmit={handleSubmitCourse}
        course={selectedCourse}
      />
    </div>
  );
}
