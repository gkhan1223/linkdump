'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Course, Link } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import LinkList from '@/components/link/LinkList';
import LinkModal from '@/components/link/LinkModal';
import { useToast } from '@/hooks/use-toast';

const statusConfig = {
  before: { label: '교육 전', className: 'bg-blue-100 text-blue-700' },
  ongoing: { label: '교육 중', className: 'bg-green-100 text-green-700' },
  completed: { label: '교육 완료', className: 'bg-gray-100 text-gray-500' },
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);

  const courseId = params.id as string;

  // 과정 정보 조회
  const fetchCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      setCourse(data);
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  // 링크 목록 조회
  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
    fetchLinks();
  }, [courseId]);

  // 링크 추가/수정
  const handleSubmitLink = async (formData: any) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('인증되지 않은 사용자');

      if (selectedLink) {
        // 수정
        const { error } = await supabase
          .from('links')
          .update({
            title: formData.title,
            url: formData.url,
            category: formData.category || null,
          })
          .eq('id', selectedLink.id);

        if (error) throw error;
        toast({ title: '성공', description: '링크가 수정되었습니다.' });
      } else {
        // 추가
        const { error } = await supabase.from('links').insert({
          course_id: courseId,
          title: formData.title,
          url: formData.url,
          category: formData.category || null,
          created_by: user.id,
          is_admin_created: true,
        });

        if (error) throw error;
        toast({ title: '성공', description: '링크가 추가되었습니다.' });
      }

      fetchLinks();
    } catch (error: any) {
      console.error('Error submitting link:', error);
      toast({
        title: '오류',
        description: error.message || '링크 저장에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 링크 삭제
  const handleDeleteLink = async (link: Link) => {
    if (!confirm(`"${link.title}" 링크를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('links').delete().eq('id', link.id);

      if (error) throw error;

      toast({ title: '성공', description: '링크가 삭제되었습니다.' });
      fetchLinks();
    } catch (error: any) {
      console.error('Error deleting link:', error);
      toast({
        title: '오류',
        description: '링크 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  if (loading || !course) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  const statusInfo = statusConfig[course.status];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {course.client_name} 교육 과정
            </h1>
            <Badge className={`mt-2 ${statusInfo.className}`}>
              {statusInfo.label}
            </Badge>
          </div>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          과정 수정
        </Button>
      </div>

      {/* 과정 정보 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">강사</p>
            <p className="text-base font-medium">{course.instructor_email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">교육 날짜</p>
            <p className="text-base font-medium">
              {format(new Date(course.education_date), 'yyyy년 M월 d일 (E)', {
                locale: ko,
              })}
            </p>
          </div>
          {course.memo && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">메모</p>
              <p className="text-base">{course.memo}</p>
            </div>
          )}
        </div>
      </div>

      {/* 링크 관리 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">링크 관리</h2>
          <Button
            className="flex items-center gap-2"
            onClick={() => {
              setSelectedLink(null);
              setLinkModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            링크 추가
          </Button>
        </div>

        <LinkList
          links={links}
          onEdit={(link) => {
            setSelectedLink(link);
            setLinkModalOpen(true);
          }}
          onDelete={handleDeleteLink}
        />
      </div>

      {/* 링크 추가/수정 모달 */}
      <LinkModal
        open={linkModalOpen}
        onClose={() => {
          setLinkModalOpen(false);
          setSelectedLink(null);
        }}
        onSubmit={handleSubmitLink}
        link={selectedLink}
      />
    </div>
  );
}
