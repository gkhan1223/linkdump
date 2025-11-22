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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link } from '@/types/database';

const linkSchema = z.object({
  title: z.string().min(1, '링크 제목을 입력해주세요'),
  url: z.string().url('올바른 URL 형식이 아닙니다'),
  category: z.string().optional(),
});

type LinkFormData = z.infer<typeof linkSchema>;

interface LinkModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: LinkFormData) => Promise<void>;
  link?: Link | null;
}

const CATEGORIES = [
  '회의록',
  '수강생 공유자료',
  '가이드',
  '후속코칭 시트',
  '기타',
];

export default function LinkModal({
  open,
  onClose,
  onSubmit,
  link,
}: LinkModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
  });

  const selectedCategory = watch('category');

  useEffect(() => {
    if (link) {
      reset({
        title: link.title,
        url: link.url,
        category: link.category || '',
      });
    } else {
      reset({
        title: '',
        url: '',
        category: '',
      });
    }
  }, [link, reset]);

  const handleFormSubmit = async (data: LinkFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{link ? '링크 수정' : '링크 추가'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">링크 제목 *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="예: 킥오프 미팅 회의록"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              {...register('url')}
              placeholder="https://example.com"
            />
            {errors.url && (
              <p className="text-sm text-red-600 mt-1">{errors.url.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category">카테고리</Label>
            <Select
              value={selectedCategory || ''}
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '저장 중...' : link ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
