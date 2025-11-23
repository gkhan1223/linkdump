// src/app/(instructor)/instructor/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/auth-context';
import CourseCard from '@/components/course/CourseCard';
import CourseFilter, { FilterState } from '@/components/course/CourseFilter';
import type { Course } from '@/types/database';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const supabase = createClient();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    sortBy: 'newest',
  });

  // 본인 과정 조회
  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('instructor_id', user.id) // 본인 과정만
          .eq('is_deleted', false) // 삭제되지 않은 과정만
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCourses(data || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user, supabase]);

  // 필터링 및 정렬
  useEffect(() => {
    let result = [...courses];

    // 검색 필터
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((course) =>
        course.client_name.toLowerCase().includes(searchLower)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">내 교육 과정</h1>
        <p className="text-sm text-gray-500 mt-1">
          총 {filteredCourses.length}개의 과정
        </p>
      </div>

      {/* 필터 및 검색 */}
      <CourseFilter filters={filters} onFilterChange={setFilters} />

      {/* 과정 카드 그리드 */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">배정된 과정이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isInstructor={true} // Instructor 모드
            />
          ))}
        </div>
      )}
    </div>
  );
}
