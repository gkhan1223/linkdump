'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Course } from '@/types/database';

const courseSchema = z.object({
  client_name: z.string().min(1, '고객사명을 입력해주세요'),
  instructor_email: z.string().email('올바른 이메일 형식이 아닙니다'),
  education_date: z.string().min(1, '교육 날짜를 선택해주세요'),
  memo: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CourseFormData) => Promise<void>;
  course?: Course | null;
}

export default function CourseModal({
  open,
  onClose,
  onSubmit,
  course,
}: CourseModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
  });

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (course) {
      reset({
        client_name: course.client_name,
        instructor_email: course.instructor_email,
        education_date: course.education_date,
        memo: course.memo || '',
      });
    } else {
      reset({
        client_name: '',
        instructor_email: '',
        education_date: '',
        memo: '',
      });
    }
  }, [course, reset]);

  const handleFormSubmit = async (data: CourseFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {course ? '과정 수정' : '과정 추가'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* 고객사명 */}
          <div>
            <Label htmlFor="client_name">고객사명 *</Label>
            <Input
              id="client_name"
              {...register('client_name')}
              placeholder="예: 삼성전자"
            />
            {errors.client_name && (
              <p className="text-sm text-red-600 mt-1">
                {errors.client_name.message}
              </p>
            )}
          </div>

          {/* 강사 이메일 */}
          <div>
            <Label htmlFor="instructor_email">강사 이메일 *</Label>
            <Input
              id="instructor_email"
              type="email"
              {...register('instructor_email')}
              placeholder="instructor@example.com"
            />
            {errors.instructor_email && (
              <p className="text-sm text-red-600 mt-1">
                {errors.instructor_email.message}
              </p>
            )}
          </div>

          {/* 교육 날짜 */}
          <div>
            <Label htmlFor="education_date">교육 날짜 *</Label>
            <Input
              id="education_date"
              type="date"
              {...register('education_date')}
            />
            {errors.education_date && (
              <p className="text-sm text-red-600 mt-1">
                {errors.education_date.message}
              </p>
            )}
          </div>

          {/* 메모 */}
          <div>
            <Label htmlFor="memo">메모</Label>
            <Textarea
              id="memo"
              {...register('memo')}
              placeholder="과정에 대한 메모..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : course ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
