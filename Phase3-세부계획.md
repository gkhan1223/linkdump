# Phase 3: Instructor 기능 구현 - 상세 실행 계획

**목표**: 강사(Instructor)를 위한 대시보드 및 링크 관리 기능 완성
**예상 소요 시간**: 2-3일
**전제 조건**: Phase 2 완료 (Admin 핵심 기능 구현)

---

## 📋 Phase 3 개요

### 주요 목표
1. ✅ Instructor 전용 레이아웃 구현 (간소화된 헤더, 사이드바 없음)
2. ✅ Instructor 대시보드 메인 화면 (본인 과정만 조회)
3. ✅ 과정 필터링 및 정렬 (Admin 기능 재사용)
4. ✅ 과정 상세 화면 (읽기 전용 + 링크 권한 구분)
5. ✅ 강사 전용 링크 관리 (추가/수정/삭제 권한 제어)

### 완료 기준
- [ ] Instructor가 본인 과정만 조회할 수 있음
- [ ] 과정 필터링(고객사, 상태, 날짜) 정상 동작
- [ ] 과정 검색 정상 동작
- [ ] 과정 정보는 읽기 전용 (수정 불가)
- [ ] 운영진 링크와 본인 링크를 시각적으로 구분
- [ ] 본인이 추가한 링크만 수정/삭제 가능
- [ ] 링크 개수 표시: "운영진 링크 + 내 링크" 형식

### Admin vs Instructor 차이점

| 기능 | Admin | Instructor |
|------|-------|------------|
| 레이아웃 | 헤더 + 사이드바 | 헤더만 (간소화) |
| 과정 조회 | 전체 과정 | 본인 과정만 |
| 과정 CRUD | 생성/수정/삭제 가능 | 읽기 전용 |
| 링크 조회 | 전체 링크 | 전체 링크 (구분 표시) |
| 링크 CRUD | 모든 링크 수정/삭제 | 본인 링크만 수정/삭제 |
| 휴지통 | 접근 가능 | 접근 불가 |
| 강사 필터 | 있음 | 없음 (본인만 보임) |

---

## 🎨 Task 1: Instructor 레이아웃 구현 (0.5일)

### 1-1. Instructor 레이아웃 파일 생성

**목표**: Instructor 전용 간소화된 레이아웃 (헤더만, 사이드바 없음)

#### Step 1.1.1: Instructor 레이아웃 생성

- [ ] 파일 생성: `src/app/(instructor)/layout.tsx`
- [ ] 다음 코드 작성:

```typescript
// src/app/(instructor)/layout.tsx

import InstructorHeader from '@/components/layout/InstructorHeader';

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <InstructorHeader />

      {/* 메인 콘텐츠 (사이드바 없음) */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
```

**검증**:
- [ ] 파일 생성 확인
- [ ] Instructor 경로 접근 시 사이드바 없이 헤더만 표시

---

### 1-2. InstructorHeader 컴포넌트 생성

**목표**: 간소화된 헤더 (로고, 페이지 제목, 사용자 정보, 로그아웃)

#### Step 1.2.1: InstructorHeader 컴포넌트 파일 생성

- [ ] 파일 생성: `src/components/layout/InstructorHeader.tsx`
- [ ] 다음 코드 작성:

```typescript
// src/components/layout/InstructorHeader.tsx

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
import { useRouter } from 'next/navigation';

export default function InstructorHeader() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : user?.email?.[0].toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
        {/* 로고 및 타이틀 */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">LinkDump</h1>
          <span className="text-sm text-gray-500">내 교육 과정</span>
        </div>

        {/* 사용자 메뉴 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {profile?.name || '강사'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
```

**검증**:
- [ ] 헤더가 정상적으로 표시됨
- [ ] 사용자 이름/이메일이 표시됨
- [ ] 로그아웃 버튼 클릭 시 로그인 페이지로 이동

---

## 📊 Task 2: Instructor 대시보드 구현 (1일)

### 2-1. Instructor 대시보드 페이지 생성

**목표**: 본인 과정만 조회하는 대시보드

#### Step 2.1.1: Instructor 대시보드 페이지 생성

- [ ] 파일 생성: `src/app/(instructor)/instructor/dashboard/page.tsx`
- [ ] 다음 코드 작성:

```typescript
// src/app/(instructor)/instructor/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/auth-context';
import CourseCard from '@/components/course/CourseCard';
import CourseFilter from '@/components/course/CourseFilter';
import type { Course } from '@/types/database';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const supabase = createClient();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

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
        setFilteredCourses(data || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

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
      <CourseFilter
        courses={courses}
        onFilteredCoursesChange={setFilteredCourses}
        showInstructorFilter={false} // 강사 필터 숨김
      />

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
```

**검증**:
- [ ] Instructor로 로그인 시 본인 과정만 표시됨
- [ ] 삭제된 과정은 표시되지 않음
- [ ] 과정 개수가 정확히 표시됨

---

### 2-2. CourseCard 컴포넌트 수정 (Instructor 모드 지원)

**목표**: CourseCard에 Instructor 모드 추가 (링크 개수 표시 방식 변경)

#### Step 2.2.1: CourseCard에 isInstructor prop 추가

- [ ] 파일 수정: `src/components/course/CourseCard.tsx`
- [ ] `isInstructor` prop 추가 및 링크 개수 표시 로직 수정:

```typescript
// src/components/course/CourseCard.tsx 일부 수정

interface CourseCardProps {
  course: Course;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  isInstructor?: boolean; // 추가
}

export default function CourseCard({
  course,
  onEdit,
  onDelete,
  isInstructor = false, // 기본값 false
}: CourseCardProps) {
  const supabase = createClient();
  const { user } = useAuth();
  const [linkCount, setLinkCount] = useState<{
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

      setLinkCount({
        admin: adminLinks,
        instructor: instructorLinks,
        total: data.length,
      });
    };

    fetchLinkCount();
  }, [course.id, isInstructor, user?.id]);

  // ... 나머지 코드 ...

  return (
    <Card>
      {/* ... 기존 코드 ... */}

      {/* 링크 개수 표시 */}
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <span>🔗</span>
        {isInstructor ? (
          <span>{linkCount.admin}+{linkCount.instructor}</span>
        ) : (
          <span>{linkCount.total}</span>
        )}
      </div>

      {/* ... 나머지 코드 ... */}
    </Card>
  );
}
```

**검증**:
- [ ] Instructor 모드에서 링크 개수가 "5+2" 형식으로 표시됨 (운영진 5개 + 내가 추가한 2개)
- [ ] Admin 모드에서는 기존대로 전체 개수만 표시됨

---

### 2-3. CourseFilter 컴포넌트 수정 (강사 필터 옵션)

**목표**: CourseFilter에 강사 필터 표시/숨김 옵션 추가

#### Step 2.3.1: showInstructorFilter prop 추가

- [ ] 파일 수정: `src/components/course/CourseFilter.tsx`
- [ ] `showInstructorFilter` prop 추가:

```typescript
// src/components/course/CourseFilter.tsx 일부 수정

interface CourseFilterProps {
  courses: Course[];
  onFilteredCoursesChange: (filtered: Course[]) => void;
  showInstructorFilter?: boolean; // 추가
}

export default function CourseFilter({
  courses,
  onFilteredCoursesChange,
  showInstructorFilter = true, // 기본값 true (Admin용)
}: CourseFilterProps) {
  // ... 필터 로직 ...

  return (
    <div className="space-y-4">
      {/* ... 기존 필터들 ... */}

      {/* 강사 필터 (Instructor 모드에서는 숨김) */}
      {showInstructorFilter && (
        <Select value={instructorFilter} onValueChange={setInstructorFilter}>
          <SelectTrigger>
            <SelectValue placeholder="강사 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 강사</SelectItem>
            {/* ... 강사 목록 ... */}
          </SelectContent>
        </Select>
      )}

      {/* ... 나머지 필터들 ... */}
    </div>
  );
}
```

**검증**:
- [ ] Instructor 대시보드에서 강사 필터가 숨겨짐
- [ ] Admin 대시보드에서는 강사 필터가 정상 표시됨

---

## 🔗 Task 3: Instructor 과정 상세 화면 구현 (0.5일)

### 3-1. Instructor 과정 상세 페이지 생성

**목표**: 읽기 전용 과정 정보 + 권한별 링크 관리

#### Step 3.1.1: Instructor 과정 상세 페이지 생성

- [ ] 파일 생성: `src/app/(instructor)/instructor/courses/[id]/page.tsx`
- [ ] 다음 코드 작성:

```typescript
// src/app/(instructor)/instructor/courses/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LinkList from '@/components/link/LinkList';
import LinkModal from '@/components/link/LinkModal';
import { ArrowLeft } from 'lucide-react';
import type { Course, Link } from '@/types/database';
import { format } from 'date-fns';

export default function InstructorCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [course, setCourse] = useState<Course | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLinkModal, setShowLinkModal] = useState(false);

  const courseId = params.id as string;

  // 과정 및 링크 조회
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // 과정 조회 (본인 과정인지 확인)
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .eq('instructor_id', user.id) // 본인 과정만
          .single();

        if (courseError || !courseData) {
          alert('과정을 찾을 수 없거나 접근 권한이 없습니다.');
          router.push('/instructor/dashboard');
          return;
        }

        setCourse(courseData);

        // 링크 조회
        const { data: linksData, error: linksError } = await supabase
          .from('links')
          .select('*')
          .eq('course_id', courseId)
          .order('created_at', { ascending: false });

        if (linksError) throw linksError;
        setLinks(linksData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, courseId]);

  const handleLinkAdded = (newLink: Link) => {
    setLinks([newLink, ...links]);
    setShowLinkModal(false);
  };

  const handleLinkUpdated = (updatedLink: Link) => {
    setLinks(links.map((link) => (link.id === updatedLink.id ? updatedLink : link)));
  };

  const handleLinkDeleted = (linkId: string) => {
    setLinks(links.filter((link) => link.id !== linkId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  const statusBadge = {
    before: { label: '교육 전', variant: 'default' as const },
    ongoing: { label: '교육 중', variant: 'secondary' as const },
    completed: { label: '교육 완료', variant: 'outline' as const },
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/instructor/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {course.client_name} 교육 과정
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              과정 상세 정보 및 링크 관리
            </p>
          </div>
        </div>
      </div>

      {/* 과정 정보 (읽기 전용) */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">고객사</label>
            <p className="mt-1 text-gray-900">{course.client_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">교육 날짜</label>
            <p className="mt-1 text-gray-900">
              {format(new Date(course.education_date), 'yyyy년 MM월 dd일')}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">진행 상황</label>
            <div className="mt-1">
              <Badge variant={statusBadge[course.status].variant}>
                {statusBadge[course.status].label}
              </Badge>
            </div>
          </div>
          {course.memo && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">메모</label>
              <p className="mt-1 text-gray-900">{course.memo}</p>
            </div>
          )}
        </div>
      </div>

      {/* 링크 관리 */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">링크 관리</h2>
          <Button onClick={() => setShowLinkModal(true)}>링크 추가</Button>
        </div>

        <div className="p-6">
          <LinkList
            links={links}
            courseId={courseId}
            onLinkUpdated={handleLinkUpdated}
            onLinkDeleted={handleLinkDeleted}
            isInstructor={true} // Instructor 모드
          />
        </div>
      </div>

      {/* 링크 추가 모달 */}
      {showLinkModal && (
        <LinkModal
          courseId={courseId}
          onClose={() => setShowLinkModal(false)}
          onLinkAdded={handleLinkAdded}
          isInstructor={true} // Instructor 모드
        />
      )}
    </div>
  );
}
```

**검증**:
- [ ] 본인 과정만 접근 가능
- [ ] 다른 강사 과정 접근 시 대시보드로 리다이렉트
- [ ] 과정 정보가 읽기 전용으로 표시됨
- [ ] 링크 추가 버튼이 정상 작동

---

## 🔐 Task 4: 링크 권한 제어 구현 (0.5일)

### 4-1. LinkList 컴포넌트 수정 (권한별 UI 구분)

**목표**: 운영진 링크와 본인 링크를 시각적으로 구분하고 권한 제어

#### Step 4.1.1: LinkList에 isInstructor prop 추가

- [ ] 파일 수정: `src/components/link/LinkList.tsx`
- [ ] 권한별 UI 구분 추가:

```typescript
// src/components/link/LinkList.tsx 일부 수정

interface LinkListProps {
  links: Link[];
  courseId: string;
  onLinkUpdated: (link: Link) => void;
  onLinkDeleted: (linkId: string) => void;
  isInstructor?: boolean; // 추가
}

export default function LinkList({
  links,
  courseId,
  onLinkUpdated,
  onLinkDeleted,
  isInstructor = false,
}: LinkListProps) {
  const { user } = useAuth();

  // 링크를 카테고리별로 그룹핑
  const groupedLinks = links.reduce((acc, link) => {
    const category = link.category || '기타';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(link);
    return acc;
  }, {} as Record<string, Link[]>);

  const canEditLink = (link: Link) => {
    if (!isInstructor) return true; // Admin은 모든 링크 수정 가능
    return !link.is_admin_created && link.created_by === user?.id; // Instructor는 본인 링크만
  };

  return (
    <div className="space-y-4">
      {Object.entries(groupedLinks).map(([category, categoryLinks]) => (
        <Accordion key={category} type="single" collapsible defaultValue={category}>
          <AccordionItem value={category}>
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <span className="font-medium">{category}</span>
                <Badge variant="secondary">{categoryLinks.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {categoryLinks.map((link) => {
                  const isAdminLink = link.is_admin_created;
                  const canEdit = canEditLink(link);

                  return (
                    <div
                      key={link.id}
                      className={`p-4 rounded-lg border ${
                        isAdminLink && isInstructor
                          ? 'bg-gray-50 border-gray-200' // 운영진 링크는 회색 배경
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 truncate">
                              {link.title}
                            </h4>
                            {isAdminLink && isInstructor && (
                              <Badge variant="outline" className="text-xs">
                                운영진
                              </Badge>
                            )}
                          </div>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline truncate block mt-1"
                          >
                            {link.url}
                          </a>
                        </div>

                        {/* 수정/삭제 버튼 (권한 있을 때만 표시) */}
                        {canEdit && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                // 수정 모달 열기 로직
                              }}
                            >
                              ✏️
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                // 삭제 확인 로직
                              }}
                            >
                              🗑
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}

      {links.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          등록된 링크가 없습니다.
        </div>
      )}
    </div>
  );
}
```

**검증**:
- [ ] 운영진 링크는 회색 배경 + "운영진" 배지 표시
- [ ] 본인 링크는 일반 배경 + 수정/삭제 버튼 표시
- [ ] 운영진 링크는 수정/삭제 버튼 없음 (Instructor 모드)

---

### 4-2. LinkModal 컴포넌트 수정 (Instructor 모드)

**목표**: Instructor가 추가하는 링크는 `is_admin_created = false` 설정

#### Step 4.2.1: LinkModal에 isInstructor prop 추가

- [ ] 파일 수정: `src/components/link/LinkModal.tsx`
- [ ] `isInstructor` prop 추가 및 링크 생성 로직 수정:

```typescript
// src/components/link/LinkModal.tsx 일부 수정

interface LinkModalProps {
  courseId: string;
  linkToEdit?: Link;
  onClose: () => void;
  onLinkAdded: (link: Link) => void;
  onLinkUpdated?: (link: Link) => void;
  isInstructor?: boolean; // 추가
}

export default function LinkModal({
  courseId,
  linkToEdit,
  onClose,
  onLinkAdded,
  onLinkUpdated,
  isInstructor = false,
}: LinkModalProps) {
  const { user } = useAuth();
  const supabase = createClient();

  const onSubmit = async (values: LinkFormValues) => {
    try {
      if (linkToEdit) {
        // 링크 수정
        const { data, error } = await supabase
          .from('links')
          .update({
            title: values.title,
            url: values.url,
            category: values.category,
          })
          .eq('id', linkToEdit.id)
          .select()
          .single();

        if (error) throw error;
        if (onLinkUpdated) onLinkUpdated(data);
      } else {
        // 새 링크 추가
        const { data, error } = await supabase
          .from('links')
          .insert({
            course_id: courseId,
            title: values.title,
            url: values.url,
            category: values.category,
            created_by: user?.id,
            is_admin_created: !isInstructor, // Instructor는 false, Admin은 true
          })
          .select()
          .single();

        if (error) throw error;
        onLinkAdded(data);
      }

      onClose();
    } catch (error) {
      console.error('Error saving link:', error);
      alert('링크 저장에 실패했습니다.');
    }
  };

  // ... 나머지 코드 ...
}
```

**검증**:
- [ ] Instructor가 추가한 링크는 `is_admin_created = false`로 저장됨
- [ ] Admin이 추가한 링크는 `is_admin_created = true`로 저장됨
- [ ] `created_by`에 사용자 ID가 정확히 저장됨

---

## ✅ Task 5: 테스트 및 검증 (0.5일)

### 5-1. Instructor 기능 전체 테스트

#### Step 5.1.1: 시나리오 테스트

**테스트 시나리오 1: Instructor 로그인 및 대시보드**
- [ ] Instructor 이메일로 매직 링크 로그인
- [ ] 본인 과정만 표시되는지 확인
- [ ] 다른 강사의 과정은 표시되지 않는지 확인
- [ ] 삭제된 과정은 표시되지 않는지 확인

**테스트 시나리오 2: 과정 필터링 및 검색**
- [ ] 고객사 필터 동작 확인
- [ ] 상태 필터 (교육 전/중/완료) 동작 확인
- [ ] 날짜 범위 필터 동작 확인
- [ ] 검색 기능 동작 확인
- [ ] 강사 필터가 숨겨져 있는지 확인

**테스트 시나리오 3: 과정 상세 화면**
- [ ] 과정 정보가 읽기 전용으로 표시되는지 확인
- [ ] 다른 강사 과정 URL 직접 접근 시 차단되는지 확인
- [ ] 링크 목록이 정상 표시되는지 확인

**테스트 시나리오 4: 링크 권한 제어**
- [ ] 운영진 링크는 회색 배경 + "운영진" 배지 표시 확인
- [ ] 운영진 링크는 수정/삭제 버튼 없음 확인
- [ ] 본인이 추가한 링크만 수정/삭제 버튼 표시 확인
- [ ] 링크 추가 시 `is_admin_created = false` 저장 확인
- [ ] 링크 개수가 "5+2" 형식으로 표시되는지 확인

**테스트 시나리오 5: 반응형 디자인**
- [ ] 모바일 화면에서 정상 동작 확인
- [ ] 태블릿 화면에서 정상 동작 확인
- [ ] 데스크톱 화면에서 정상 동작 확인

---

### 5-2. RLS 정책 확인

#### Step 5.2.1: RLS 정책 테스트

**확인 사항**:
- [ ] Instructor는 본인 과정만 조회 가능 (`instructor_id = auth.uid()`)
- [ ] Instructor는 본인 과정의 링크만 조회 가능
- [ ] Instructor는 본인이 만든 링크만 수정/삭제 가능
- [ ] Instructor는 과정을 생성/수정/삭제할 수 없음

**테스트 방법**:
1. Supabase Dashboard → SQL Editor
2. 다음 쿼리로 RLS 정책 확인:
   ```sql
   -- Instructor가 볼 수 있는 과정 확인
   SELECT * FROM courses WHERE instructor_id = 'instructor-user-id';

   -- Instructor가 수정할 수 있는 링크 확인
   SELECT * FROM links WHERE created_by = 'instructor-user-id' AND is_admin_created = false;
   ```

---

## 📝 완료 체크리스트

### Phase 3 전체 완료 확인

- [ ] **레이아웃**
  - [ ] InstructorHeader 컴포넌트 정상 동작
  - [ ] 사이드바 없이 헤더만 표시
  - [ ] 로그아웃 기능 정상 동작

- [ ] **대시보드**
  - [ ] 본인 과정만 조회됨
  - [ ] 삭제된 과정은 표시되지 않음
  - [ ] 필터 및 검색 정상 동작
  - [ ] 강사 필터가 숨겨짐
  - [ ] 링크 개수가 "운영진+본인" 형식으로 표시

- [ ] **과정 상세**
  - [ ] 과정 정보 읽기 전용
  - [ ] 다른 강사 과정 접근 차단
  - [ ] 링크 목록 정상 표시

- [ ] **링크 권한 제어**
  - [ ] 운영진 링크 시각적 구분 (회색 배경 + 배지)
  - [ ] 본인 링크만 수정/삭제 가능
  - [ ] 링크 추가 시 `is_admin_created = false` 저장
  - [ ] RLS 정책 정상 동작

- [ ] **반응형 디자인**
  - [ ] 모바일/태블릿/데스크톱 모두 정상 동작

---

## 🚀 다음 단계: Phase 4

Phase 3가 완료되면 다음 단계로 진행합니다:

### Phase 4: 고급 기능 및 최적화 (2-3일)
- 실시간 업데이트 (Supabase Realtime)
- 검색 기능 강화 (Debounced search)
- 페이지네이션 및 무한 스크롤
- 성능 최적화
- 에러 처리 및 로딩 상태 개선

---

## 📚 참고 자료

- **기획 문서**: `기획.md`
- **Phase 1 계획**: `Phase1-세부계획.md`
- **Phase 2 계획**: `Phase2-세부계획.md`
- **Supabase RLS**: https://supabase.com/docs/guides/auth/row-level-security
- **Next.js App Router**: https://nextjs.org/docs/app
- **shadcn/ui**: https://ui.shadcn.com/

---

## 🐛 트러블슈팅

### 문제 1: Instructor가 다른 강사의 과정을 볼 수 있음

**원인**: RLS 정책이 제대로 적용되지 않음

**해결**:
```sql
-- courses 테이블 RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'courses';

-- Instructor 조회 정책 재생성
CREATE POLICY "Instructors can view their own courses"
ON courses FOR SELECT
TO authenticated
USING (instructor_id = auth.uid() AND is_deleted = false);
```

### 문제 2: Instructor가 운영진 링크를 수정할 수 있음

**원인**: LinkList 컴포넌트의 권한 체크 로직 오류

**해결**:
- `canEditLink` 함수에서 `is_admin_created` 확인
- `created_by === user.id` 조건 추가

### 문제 3: 링크 개수가 "5+2" 형식으로 표시되지 않음

**원인**: CourseCard의 링크 개수 계산 로직 오류

**해결**:
- `isInstructor` prop이 제대로 전달되는지 확인
- `is_admin_created` 필드로 운영진/강사 링크 구분
- `created_by` 필드로 본인 링크 필터링

---

**🎉 Phase 3 완료 후 반드시 커밋하고 Phase 4로 진행하세요!**
