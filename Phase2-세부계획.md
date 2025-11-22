# Phase 2: Admin 핵심 기능 구현 - 상세 실행 계획

**목표**: Admin 사용자를 위한 과정 관리 및 링크 관리 핵심 기능 완성
**예상 소요 시간**: 4-5일
**전제 조건**: Phase 1 완료 (데이터베이스 구축 및 인증 시스템)

---

## 📋 Phase 2 개요

### 주요 목표
1. ✅ Admin 레이아웃 및 네비게이션 구현
2. ✅ Admin 대시보드 메인 화면 (과정 카드 그리드, 필터, 검색)
3. ✅ 과정 CRUD 기능 (추가/수정/소프트 삭제)
4. ✅ 과정 상세 화면 및 링크 관리 (카테고리별 그룹핑)
5. ✅ 휴지통 기능 (복구/영구 삭제)

### 완료 기준
- [ ] Admin이 과정을 생성/수정/삭제할 수 있음
- [ ] 과정 필터링(고객사, 강사, 상태, 날짜) 정상 동작
- [ ] 과정 검색 정상 동작
- [ ] 과정 상세 화면에서 링크 CRUD 가능
- [ ] 링크가 카테고리별로 그룹핑되어 표시됨
- [ ] 휴지통에서 삭제된 과정 복구/영구 삭제 가능
- [ ] 반응형 디자인 동작 확인 (모바일/데스크톱)

---

## 🎨 Task 1: Admin 레이아웃 및 네비게이션 (0.5일)

### 1-1. shadcn/ui 컴포넌트 설치

**목표**: 필요한 UI 컴포넌트 사전 설치

#### Step 1.1.1: shadcn/ui 초기화 (아직 안 했다면)

- [ ] 터미널에서 실행:
  ```bash
  npx shadcn-ui@latest init
  ```

- [ ] 설정 선택:
  - Style: Default
  - Base color: Slate
  - CSS variables: Yes

#### Step 1.1.2: 필요한 컴포넌트 설치

- [ ] 다음 명령어 실행:
  ```bash
  npx shadcn-ui@latest add button card input label select dialog badge
  npx shadcn-ui@latest add dropdown-menu avatar sheet separator
  npx shadcn-ui@latest add accordion toast
  ```

**검증**:
- [ ] `src/components/ui/` 폴더에 컴포넌트 파일들 생성 확인

---

### 1-2. Admin 레이아웃 컴포넌트 구현

**목표**: Admin 전용 레이아웃 (헤더 + 사이드바)

#### Step 1.2.1: Admin 레이아웃 파일 생성

- [ ] 파일 생성: `src/app/(admin)/layout.tsx`
- [ ] 다음 코드 작성:

```typescript
// src/app/(admin)/layout.tsx

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
```

#### Step 1.2.2: AdminHeader 컴포넌트 생성

- [ ] 파일 생성: `src/components/layout/AdminHeader.tsx`
- [ ] 다음 코드 작성:

```typescript
// src/components/layout/AdminHeader.tsx

'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Menu, LogOut, User } from 'lucide-react';
import { useState } from 'react';

export default function AdminHeader() {
  const { profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* 로고 및 타이틀 */}
        <div className="flex items-center gap-4">
          {/* 모바일 메뉴 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LD</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">LinkDump</h1>
              <p className="text-xs text-gray-500">운영진 대시보드</p>
            </div>
          </div>
        </div>

        {/* 사용자 정보 및 메뉴 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {profile && getInitials(profile.name, profile.email)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium">
                {profile?.name || profile?.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>내 계정</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              <span>{profile?.email}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>로그아웃</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

#### Step 1.2.3: AdminSidebar 컴포넌트 생성

- [ ] 파일 생성: `src/components/layout/AdminSidebar.tsx`
- [ ] 다음 코드 작성:

```typescript
// src/components/layout/AdminSidebar.tsx

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
```

**검증**:
- [ ] `/admin/dashboard` 접근 시 헤더와 사이드바 렌더링 확인
- [ ] 반응형 동작 확인 (모바일에서 사이드바 숨김)

---

## 📊 Task 2: Admin 대시보드 메인 화면 (1일)

### 2-1. 과정 카드 컴포넌트 구현

**목표**: 과정 정보를 카드 형태로 표시하는 컴포넌트

#### Step 2.1.1: CourseCard 컴포넌트 생성

- [ ] 파일 생성: `src/components/course/CourseCard.tsx`
- [ ] 다음 코드 작성:

```typescript
// src/components/course/CourseCard.tsx

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

interface CourseCardProps {
  course: Course;
  linkCount?: number;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
}

const statusConfig = {
  before: { label: '교육 전', className: 'bg-blue-100 text-blue-700' },
  ongoing: { label: '교육 중', className: 'bg-green-100 text-green-700' },
  completed: { label: '교육 완료', className: 'bg-gray-100 text-gray-500' },
};

export default function CourseCard({
  course,
  linkCount = 0,
  onEdit,
  onDelete,
}: CourseCardProps) {
  const statusInfo = statusConfig[course.status];
  const isCompleted = course.status === 'completed';

  return (
    <Link href={`/admin/courses/${course.id}`}>
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
          <span>{linkCount}개</span>
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
```

**검증**:
- [ ] 카드 컴포넌트 TypeScript 에러 없음
- [ ] 상태별 배지 색상 확인

---

### 2-2. 필터 컴포넌트 구현

**목표**: 과정을 고객사, 강사, 상태, 날짜로 필터링

#### Step 2.2.1: CourseFilter 컴포넌트 생성

- [ ] 파일 생성: `src/components/course/CourseFilter.tsx`
- [ ] 다음 코드 작성:

```typescript
// src/components/course/CourseFilter.tsx

'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

export type FilterState = {
  search: string;
  status: string;
  sortBy: string;
};

interface CourseFilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export default function CourseFilter({
  filters,
  onFilterChange,
}: CourseFilterProps) {
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value });
  };

  const handleSortChange = (value: string) => {
    onFilterChange({ ...filters, sortBy: value });
  };

  return (
    <div className="space-y-4">
      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="고객사명 또는 강사 이메일 검색..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 필터 및 정렬 */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* 진행 상황 필터 */}
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="진행 상황" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="before">교육 전</SelectItem>
            <SelectItem value="ongoing">교육 중</SelectItem>
            <SelectItem value="completed">교육 완료</SelectItem>
          </SelectContent>
        </Select>

        {/* 정렬 */}
        <Select value={filters.sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="정렬" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">최신순</SelectItem>
            <SelectItem value="date-asc">날짜순 (오름차순)</SelectItem>
            <SelectItem value="date-desc">날짜순 (내림차순)</SelectItem>
            <SelectItem value="client">고객사명순</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
```

**검증**:
- [ ] 필터 컴포넌트 렌더링 확인

---

### 2-3. Admin 대시보드 페이지 구현

**목표**: 과정 목록 조회 및 필터링/정렬 기능

#### Step 2.3.1: 대시보드 페이지 생성

- [ ] 파일 수정: `src/app/(admin)/admin/dashboard/page.tsx`
- [ ] 다음 코드 작성:

```typescript
// src/app/(admin)/admin/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Course } from '@/types/database';
import CourseCard from '@/components/course/CourseCard';
import CourseFilter, { FilterState } from '@/components/course/CourseFilter';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AdminDashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
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
        <Button className="flex items-center gap-2">
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
              linkCount={0} // TODO: 링크 개수 조회
              onEdit={(course) => {
                // TODO: 수정 모달 열기
                console.log('Edit', course);
              }}
              onDelete={(course) => {
                // TODO: 삭제 확인 다이얼로그
                console.log('Delete', course);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**검증**:
- [ ] `/admin/dashboard` 접근 시 과정 목록 표시
- [ ] 검색, 필터, 정렬 동작 확인
- [ ] 반응형 그리드 확인

---

## ✏️ Task 3: 과정 CRUD 기능 (1일)

### 3-1. 과정 추가/수정 모달 구현

**목표**: React Hook Form + Zod로 과정 생성/수정

#### Step 3.1.1: 필요한 패키지 설치 확인

- [ ] 다음 패키지 설치 (Phase 0에서 이미 설치했을 수 있음):
  ```bash
  npm install react-hook-form zod @hookform/resolvers date-fns
  ```

#### Step 3.1.2: CourseModal 컴포넌트 생성

- [ ] 파일 생성: `src/components/course/CourseModal.tsx`
- [ ] 다음 코드 작성:

```typescript
// src/components/course/CourseModal.tsx

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
```

**검증**:
- [ ] 모달 컴포넌트 에러 없음

---

### 3-2. 과정 CRUD API 통합

**목표**: Supabase를 통한 과정 생성/수정/삭제 구현

#### Step 3.2.1: 대시보드 페이지에 CRUD 로직 추가

- [ ] `src/app/(admin)/admin/dashboard/page.tsx` 수정:

```typescript
// src/app/(admin)/admin/dashboard/page.tsx 에 추가

import CourseModal from '@/components/course/CourseModal';
import { useToast } from '@/components/ui/use-toast';

// ... (기존 코드)

export default function AdminDashboard() {
  // ... (기존 state)
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { toast } = useToast();

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

  return (
    <div className="space-y-6">
      {/* ... (기존 UI) */}

      {/* "과정 추가" 버튼 */}
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

      {/* 카드 그리드 */}
      <div className="grid ...">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onEdit={(course) => {
              setSelectedCourse(course);
              setModalOpen(true);
            }}
            onDelete={handleDeleteCourse}
          />
        ))}
      </div>

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
```

#### Step 3.2.2: Toaster 컴포넌트 설치 및 추가

- [ ] shadcn toast 설치:
  ```bash
  npx shadcn-ui@latest add toast
  ```

- [ ] `src/app/layout.tsx`에 Toaster 추가:
  ```typescript
  import { Toaster } from '@/components/ui/toaster';

  export default function RootLayout({ children }) {
    return (
      <html lang="ko">
        <body>
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </body>
      </html>
    );
  }
  ```

**검증**:
- [ ] 과정 추가 성공
- [ ] 과정 수정 성공
- [ ] 과정 삭제(소프트) 성공
- [ ] Toast 알림 표시 확인

---

## 🔗 Task 4: 과정 상세 화면 및 링크 관리 (1.5일)

### 4-1. 과정 상세 페이지 생성

**목표**: 과정 정보 표시 및 링크 관리 UI

#### Step 4.1.1: 과정 상세 페이지 생성

- [ ] 디렉토리 생성: `src/app/(admin)/admin/courses/[id]/`
- [ ] 파일 생성: `src/app/(admin)/admin/courses/[id]/page.tsx`
- [ ] 다음 코드 작성:

```typescript
// src/app/(admin)/admin/courses/[id]/page.tsx

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

const statusConfig = {
  before: { label: '교육 전', className: 'bg-blue-100 text-blue-700' },
  ongoing: { label: '교육 중', className: 'bg-green-100 text-green-700' },
  completed: { label: '교육 완료', className: 'bg-gray-100 text-gray-500' },
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [course, setCourse] = useState<Course | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

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
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            링크 추가
          </Button>
        </div>

        <LinkList
          links={links}
          onEdit={(link) => {
            // TODO: 링크 수정 모달
            console.log('Edit link', link);
          }}
          onDelete={(link) => {
            // TODO: 링크 삭제
            console.log('Delete link', link);
          }}
        />
      </div>
    </div>
  );
}
```

**검증**:
- [ ] 과정 상세 페이지 접근 확인

---

### 4-2. 링크 리스트 컴포넌트 (카테고리별 그룹핑)

**목표**: 링크를 카테고리별로 그룹핑하여 표시 (Accordion)

#### Step 4.2.1: LinkList 컴포넌트 생성

- [ ] 파일 생성: `src/components/link/LinkList.tsx`
- [ ] 다음 코드 작성:

```typescript
// src/components/link/LinkList.tsx

'use client';

import { Link } from '@/types/database';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ExternalLink, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LinkListProps {
  links: Link[];
  onEdit?: (link: Link) => void;
  onDelete?: (link: Link) => void;
  readOnly?: boolean;
}

// 기본 카테고리
const DEFAULT_CATEGORIES = [
  '회의록',
  '수강생 공유자료',
  '가이드',
  '후속코칭 시트',
  '기타',
];

export default function LinkList({
  links,
  onEdit,
  onDelete,
  readOnly = false,
}: LinkListProps) {
  // 카테고리별 그룹핑
  const groupedLinks = links.reduce((acc, link) => {
    const category = link.category || '기타';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(link);
    return acc;
  }, {} as Record<string, Link[]>);

  // 카테고리 정렬 (기본 카테고리 우선, 그 외 알파벳 순)
  const sortedCategories = Object.keys(groupedLinks).sort((a, b) => {
    const aIndex = DEFAULT_CATEGORIES.indexOf(a);
    const bIndex = DEFAULT_CATEGORIES.indexOf(b);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });

  if (links.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">등록된 링크가 없습니다.</p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" defaultValue={sortedCategories} className="space-y-2">
      {sortedCategories.map((category) => {
        const categoryLinks = groupedLinks[category];
        return (
          <AccordionItem
            key={category}
            value={category}
            className="bg-white border border-gray-200 rounded-lg px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{category}</span>
                <Badge variant="secondary">{categoryLinks.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {categoryLinks.map((link) => (
                  <div
                    key={link.id}
                    className={`p-3 rounded-md border flex items-start justify-between gap-3 ${
                      link.is_admin_created
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {link.title}
                        </h4>
                        {link.is_admin_created && (
                          <Badge variant="outline" className="text-xs">
                            운영진
                          </Badge>
                        )}
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{link.url}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </div>

                    {!readOnly && (
                      <div className="flex gap-1 flex-shrink-0">
                        {onEdit && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => onEdit(link)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                            onClick={() => onDelete(link)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
```

**검증**:
- [ ] 링크 리스트 카테고리별 그룹핑 표시 확인

---

### 4-3. 링크 추가/수정 모달 및 CRUD

**목표**: 링크 추가/수정 모달 및 API 통합

#### Step 4.3.1: LinkModal 컴포넌트 생성

- [ ] 파일 생성: `src/components/link/LinkModal.tsx`
- [ ] 코드 작성 (CourseModal과 유사한 구조):

```typescript
// src/components/link/LinkModal.tsx

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
```

#### Step 4.3.2: 과정 상세 페이지에 링크 CRUD 추가

- [ ] `src/app/(admin)/admin/courses/[id]/page.tsx`에 링크 CRUD 로직 추가

```typescript
// 추가할 코드

import LinkModal from '@/components/link/LinkModal';
import { useToast } from '@/components/ui/use-toast';

// ... (컴포넌트 내부)

const [linkModalOpen, setLinkModalOpen] = useState(false);
const [selectedLink, setSelectedLink] = useState<Link | null>(null);
const { toast } = useToast();

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

// JSX에 추가
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

<LinkList
  links={links}
  onEdit={(link) => {
    setSelectedLink(link);
    setLinkModalOpen(true);
  }}
  onDelete={handleDeleteLink}
/>

<LinkModal
  open={linkModalOpen}
  onClose={() => {
    setLinkModalOpen(false);
    setSelectedLink(null);
  }}
  onSubmit={handleSubmitLink}
  link={selectedLink}
/>
```

**검증**:
- [ ] 링크 추가 성공
- [ ] 링크 수정 성공
- [ ] 링크 삭제 성공
- [ ] 카테고리별 그룹핑 확인

---

## 🗑 Task 5: 휴지통 기능 (0.5일)

### 5-1. 휴지통 페이지 구현

**목표**: 삭제된 과정 목록 조회 및 복구/영구 삭제

#### Step 5.1.1: 휴지통 페이지 생성

- [ ] 파일 생성: `src/app/(admin)/admin/trash/page.tsx`
- [ ] 다음 코드 작성:

```typescript
// src/app/(admin)/admin/trash/page.tsx

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
import { useToast } from '@/components/ui/use-toast';

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
```

**검증**:
- [ ] 휴지통 페이지 접근 확인
- [ ] 삭제된 과정 목록 표시
- [ ] 복구 기능 동작
- [ ] 영구 삭제 기능 동작

---

## ✅ Phase 2 통합 테스트

### 테스트 체크리스트

#### 레이아웃 및 네비게이션
- [ ] Admin 헤더 표시 및 사용자 메뉴 동작
- [ ] Admin 사이드바 표시 및 네비게이션 동작
- [ ] 반응형 레이아웃 동작 (모바일/데스크톱)

#### 대시보드
- [ ] 과정 목록 조회 성공
- [ ] 과정 카드 그리드 레이아웃 (5열)
- [ ] 검색 기능 동작
- [ ] 상태 필터 동작
- [ ] 정렬 기능 동작

#### 과정 CRUD
- [ ] 과정 추가 성공
- [ ] 과정 수정 성공
- [ ] 과정 소프트 삭제 성공
- [ ] 유효성 검증 동작 (빈 값, 이메일 형식)
- [ ] 존재하지 않는 강사 이메일 입력 시 에러 처리

#### 링크 관리
- [ ] 과정 상세 페이지 접근
- [ ] 링크 목록 카테고리별 그룹핑 표시
- [ ] 링크 추가 성공
- [ ] 링크 수정 성공
- [ ] 링크 삭제 성공
- [ ] Admin 링크와 Instructor 링크 시각적 구분

#### 휴지통
- [ ] 삭제된 과정 목록 조회
- [ ] 삭제 후 남은 일수 표시
- [ ] 복구 기능 동작
- [ ] 영구 삭제 기능 동작

---

## 📝 Phase 2 완료 기준

### 필수 완료 사항
✅ Admin 레이아웃 및 네비게이션 완성
- 헤더, 사이드바, 반응형 디자인

✅ Admin 대시보드 완성
- 과정 카드 그리드
- 필터, 검색, 정렬 기능

✅ 과정 CRUD 완성
- 추가/수정/삭제 (소프트)
- 유효성 검증

✅ 링크 관리 완성
- 카테고리별 그룹핑
- 링크 CRUD

✅ 휴지통 기능 완성
- 복구/영구 삭제

### 다음 단계 (Phase 3)
- Instructor 대시보드 구현
- Instructor 과정 상세 화면 (읽기 전용)
- Instructor 링크 추가/수정/삭제 (본인 링크만)

---

## 🛠 트러블슈팅

### 일반적인 문제

#### 1. shadcn/ui 컴포넌트 스타일 깨짐
**원인**: Tailwind CSS 설정 문제
**해결**: `tailwind.config.ts`에 `content` 경로 확인

#### 2. 필터/정렬이 적용되지 않음
**원인**: 상태 업데이트 타이밍 문제
**해결**: `useEffect` 의존성 배열 확인

#### 3. 링크 개수가 표시되지 않음
**원인**: JOIN 쿼리 미구현
**해결**: Supabase `.select('*, links(count)')` 사용 (Phase 4에서 최적화)

#### 4. 모달이 열리지 않음
**원인**: state 관리 문제
**해결**: `open`, `onClose` props 확인

---

## 📚 참고 자료

- [shadcn/ui Components](https://ui.shadcn.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [date-fns Documentation](https://date-fns.org/)

---

**작성일**: 2025-01-21
**Phase 2 예상 소요 시간**: 4-5일
**다음 Phase**: Phase 3 - Instructor 기능 구현
