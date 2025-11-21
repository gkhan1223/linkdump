# Phase 1: 데이터베이스 및 인증 구축 - 상세 실행 계획

**목표**: Supabase 데이터베이스 스키마 구축 및 역할 기반 인증 시스템 완성
**예상 소요 시간**: 2-3일
**전제 조건**: Phase 0 완료 (Next.js 프로젝트 생성, Supabase 프로젝트 생성)

---

## 📋 Phase 1 개요

### 주요 목표
1. ✅ Supabase 데이터베이스 스키마 완성
2. ✅ Row Level Security (RLS) 정책 구현
3. ✅ 자동화 함수 및 스케줄러 설정
4. ✅ 인증 시스템 구현 (Admin: 이메일+비밀번호, Instructor: 매직 링크)
5. ✅ 역할 기반 라우트 보호

### 완료 기준
- [ ] 3개 테이블(profiles, courses, links) 정상 생성
- [ ] RLS 정책 테스트 완료 (Admin/Instructor 권한 분리 확인)
- [ ] 자동 상태 업데이트 함수 동작 확인
- [ ] Admin 로그인 성공 (이메일+비밀번호)
- [ ] Instructor 로그인 성공 (매직 링크)
- [ ] 역할별 대시보드 접근 제한 확인

---

## 🗂 Task 1: Supabase 데이터베이스 구축 (1일)

### 1-1. Supabase 프로젝트 초기 설정

**목표**: Supabase 대시보드에서 프로젝트 설정 및 연결 확인

#### 단계별 작업

**Step 1.1.1**: Supabase 프로젝트 접속 및 정보 확인
- [ ] https://supabase.com 접속 및 로그인
- [ ] 프로젝트 선택 (Phase 0에서 생성한 프로젝트)
- [ ] Project Settings → API 메뉴 접근
- [ ] 다음 정보 복사:
  - Project URL
  - anon/public key
  - service_role key (절대 클라이언트 노출 금지, 백업용)

**Step 1.1.2**: 로컬 환경 변수 설정
- [ ] `.env.local` 파일 생성 (프로젝트 루트)
- [ ] 다음 내용 추가:
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```
- [ ] `.env.example` 파일 생성 (Git 커밋용):
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  ```
- [ ] `.gitignore`에 `.env.local` 포함 확인

**Step 1.1.3**: Supabase 연결 테스트
- [ ] Supabase 대시보드에서 SQL Editor 접근
- [ ] 간단한 쿼리 실행으로 연결 확인:
  ```sql
  SELECT now();
  ```

**검증**: Supabase 대시보드에서 현재 시간이 정상적으로 반환되는지 확인

---

### 1-2. profiles 테이블 생성

**목표**: 사용자 프로필 테이블 생성 및 트리거 설정

#### Step 1.2.1: profiles 테이블 생성 마이그레이션

- [ ] Supabase Dashboard → SQL Editor → New Query
- [ ] 다음 SQL 실행:

```sql
-- ============================================
-- Migration: Create profiles table
-- Description: 사용자 프로필 정보 (auth.users 확장)
-- Created: 2024-11-21
-- ============================================

-- profiles 테이블 생성
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'instructor')),
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 코멘트 추가 (문서화)
COMMENT ON TABLE profiles IS '사용자 프로필 정보 (Supabase Auth 확장)';
COMMENT ON COLUMN profiles.id IS '사용자 고유 ID (auth.users 참조)';
COMMENT ON COLUMN profiles.email IS '사용자 이메일';
COMMENT ON COLUMN profiles.role IS '사용자 역할 (admin, instructor)';
COMMENT ON COLUMN profiles.name IS '사용자 이름 (선택)';
```

**검증**:
- [ ] Supabase Dashboard → Table Editor에서 `profiles` 테이블 확인
- [ ] 컬럼 구조 및 제약 조건 확인

#### Step 1.2.2: updated_at 자동 업데이트 트리거 생성

- [ ] 다음 SQL 실행:

```sql
-- ============================================
-- Function: update_updated_at_column
-- Description: updated_at 컬럼을 현재 시간으로 자동 업데이트
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- profiles 테이블에 트리거 적용
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**검증**:
- [ ] Supabase Dashboard → Database → Triggers 메뉴에서 트리거 확인
- [ ] 테스트 데이터 삽입 및 업데이트 후 `updated_at` 자동 변경 확인:
  ```sql
  -- 테스트용 임시 사용자 생성 (나중에 삭제)
  -- 실제 auth.users에 사용자 생성 후 테스트
  ```

---

### 1-3. courses 테이블 생성

**목표**: 교육 과정 정보 테이블 생성

#### Step 1.3.1: courses 테이블 생성 마이그레이션

- [ ] 다음 SQL 실행:

```sql
-- ============================================
-- Migration: Create courses table
-- Description: 교육 과정 정보
-- Created: 2024-11-21
-- ============================================

-- courses 테이블 생성
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  instructor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  instructor_email TEXT NOT NULL,
  education_date DATE NOT NULL,
  status TEXT DEFAULT 'before' CHECK (status IN ('before', 'ongoing', 'completed')),
  memo TEXT,
  is_deleted BOOLEAN DEFAULT false NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_education_date ON courses(education_date);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_is_deleted ON courses(is_deleted);
CREATE INDEX IF NOT EXISTS idx_courses_deleted_at ON courses(deleted_at);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at);

-- 코멘트 추가
COMMENT ON TABLE courses IS '교육 과정 정보';
COMMENT ON COLUMN courses.client_name IS '고객사명';
COMMENT ON COLUMN courses.instructor_id IS '담당 강사 ID';
COMMENT ON COLUMN courses.instructor_email IS '강사 이메일 (검색용)';
COMMENT ON COLUMN courses.education_date IS '교육 날짜';
COMMENT ON COLUMN courses.status IS '진행 상황 (before/ongoing/completed)';
COMMENT ON COLUMN courses.is_deleted IS '소프트 삭제 플래그';
COMMENT ON COLUMN courses.deleted_at IS '삭제 일시';
```

**검증**:
- [ ] Table Editor에서 `courses` 테이블 확인
- [ ] 인덱스 생성 확인: Database → Indexes

#### Step 1.3.2: courses 테이블 트리거 적용

- [ ] 다음 SQL 실행:

```sql
-- courses 테이블에 updated_at 트리거 적용
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### 1-4. links 테이블 생성

**목표**: 과정별 링크 정보 테이블 생성

#### Step 1.4.1: links 테이블 생성 마이그레이션

- [ ] 다음 SQL 실행:

```sql
-- ============================================
-- Migration: Create links table
-- Description: 과정별 링크 정보
-- Created: 2024-11-21
-- ============================================

-- links 테이블 생성
CREATE TABLE IF NOT EXISTS links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_admin_created BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_links_course_id ON links(course_id);
CREATE INDEX IF NOT EXISTS idx_links_created_by ON links(created_by);
CREATE INDEX IF NOT EXISTS idx_links_category ON links(category);

-- 코멘트 추가
COMMENT ON TABLE links IS '과정별 링크 정보';
COMMENT ON COLUMN links.course_id IS '과정 ID (ON DELETE CASCADE)';
COMMENT ON COLUMN links.title IS '링크 제목';
COMMENT ON COLUMN links.url IS '링크 URL';
COMMENT ON COLUMN links.category IS '링크 카테고리';
COMMENT ON COLUMN links.is_admin_created IS '운영진이 만든 링크 여부';
```

**검증**:
- [ ] Table Editor에서 `links` 테이블 확인
- [ ] CASCADE 동작 확인 (나중에 테스트 데이터로 검증)

#### Step 1.4.2: links 테이블 트리거 적용

- [ ] 다음 SQL 실행:

```sql
-- links 테이블에 updated_at 트리거 적용
DROP TRIGGER IF EXISTS update_links_updated_at ON links;

CREATE TRIGGER update_links_updated_at
  BEFORE UPDATE ON links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### 1-5. 데이터베이스 함수 생성

**목표**: 자동화 로직을 위한 PostgreSQL 함수 생성

#### Step 1.5.1: 진행 상황 자동 업데이트 함수

- [ ] 다음 SQL 실행:

```sql
-- ============================================
-- Function: update_course_status
-- Description: 교육 날짜에 따라 진행 상황 자동 업데이트
-- Schedule: 매일 자정 (cron)
-- ============================================

CREATE OR REPLACE FUNCTION update_course_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE courses
  SET
    status = CASE
      WHEN education_date > CURRENT_DATE THEN 'before'
      WHEN education_date = CURRENT_DATE THEN 'ongoing'
      WHEN education_date < CURRENT_DATE THEN 'completed'
    END,
    updated_at = now()
  WHERE is_deleted = false
    AND status != CASE
      WHEN education_date > CURRENT_DATE THEN 'before'
      WHEN education_date = CURRENT_DATE THEN 'ongoing'
      WHEN education_date < CURRENT_DATE THEN 'completed'
    END;

  -- 업데이트된 행 수를 로그에 기록 (선택)
  RAISE NOTICE 'Updated % course statuses', (SELECT count(*) FROM courses WHERE is_deleted = false);
END;
$$;

-- 함수에 코멘트 추가
COMMENT ON FUNCTION update_course_status IS '교육 날짜 기반 진행 상황 자동 업데이트 (매일 자정 실행)';
```

**검증**:
- [ ] 함수 수동 실행 테스트:
  ```sql
  SELECT update_course_status();
  ```
- [ ] 테스트 데이터 삽입 후 함수 실행하여 status 변경 확인

#### Step 1.5.2: 오래된 휴지통 과정 자동 삭제 함수

- [ ] 다음 SQL 실행:

```sql
-- ============================================
-- Function: delete_old_trash
-- Description: 15일 이상 지난 삭제된 과정 영구 삭제
-- Schedule: 매일 자정 (cron)
-- ============================================

CREATE OR REPLACE FUNCTION delete_old_trash()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- 15일 이상 지난 삭제된 과정 영구 삭제
  DELETE FROM courses
  WHERE is_deleted = true
    AND deleted_at < (CURRENT_TIMESTAMP - INTERVAL '15 days');

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- 삭제된 행 수를 로그에 기록
  RAISE NOTICE 'Permanently deleted % old courses from trash', deleted_count;
END;
$$;

-- 함수에 코멘트 추가
COMMENT ON FUNCTION delete_old_trash IS '15일 이상 지난 휴지통 과정 영구 삭제 (매일 자정 실행)';
```

**검증**:
- [ ] 함수 수동 실행 테스트:
  ```sql
  SELECT delete_old_trash();
  ```

---

### 1-6. Cron Job 설정 (pg_cron 확장)

**목표**: 매일 자정 자동 실행 스케줄 설정

#### Step 1.6.1: pg_cron 확장 활성화

**참고**: Supabase는 기본적으로 pg_cron을 지원하지만, 설정 방법이 다를 수 있습니다.

- [ ] Supabase Dashboard → Database → Extensions
- [ ] `pg_cron` 검색 및 활성화 (이미 활성화되어 있을 수 있음)

**대안 방법**: Supabase는 자체 Edge Functions나 Webhooks를 사용한 스케줄링 제공
- 현재는 pg_cron이 Supabase Free tier에서 제한될 수 있으므로, 아래 두 가지 방법 병행:

#### Step 1.6.2-A: pg_cron 사용 (가능한 경우)

- [ ] 다음 SQL 실행:

```sql
-- pg_cron으로 매일 자정에 함수 실행 스케줄 설정
SELECT cron.schedule(
  'update-course-status',
  '0 0 * * *',  -- 매일 자정
  $$SELECT update_course_status()$$
);

SELECT cron.schedule(
  'delete-old-trash',
  '0 1 * * *',  -- 매일 새벽 1시 (status 업데이트 후)
  $$SELECT delete_old_trash()$$
);
```

**검증**:
- [ ] Cron Job 목록 확인:
  ```sql
  SELECT * FROM cron.job;
  ```

#### Step 1.6.2-B: Supabase Database Webhooks 사용 (권장)

**대안 방법**: Supabase는 Database Webhooks로 스케줄링 가능

- [ ] Supabase Dashboard → Database → Webhooks
- [ ] 새 Webhook 생성:
  - Name: `update-course-status-daily`
  - Schedule: Cron expression `0 0 * * *`
  - SQL Function: `update_course_status()`

- [ ] 두 번째 Webhook 생성:
  - Name: `delete-old-trash-daily`
  - Schedule: Cron expression `0 1 * * *`
  - SQL Function: `delete_old_trash()`

**참고**: Supabase의 스케줄링 기능은 플랜에 따라 다를 수 있으므로, 공식 문서 확인 필요:
- https://supabase.com/docs/guides/database/webhooks

---

### 1-7. Row Level Security (RLS) 정책 설정

**목표**: 테이블별 RLS 활성화 및 정책 구현

#### Step 1.7.1: RLS 활성화

- [ ] 다음 SQL 실행:

```sql
-- ============================================
-- Enable Row Level Security
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
```

**중요**: RLS를 활성화하면 기본적으로 모든 접근이 차단됩니다. 정책을 추가해야 데이터 접근 가능.

#### Step 1.7.2: profiles 테이블 RLS 정책

- [ ] 다음 SQL 실행:

```sql
-- ============================================
-- RLS Policies: profiles
-- ============================================

-- 1. 모든 사용자는 자신의 프로필 조회 가능
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- 2. Admin은 모든 프로필 조회 가능
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3. 시스템에서만 프로필 생성 가능 (회원가입 시 자동 생성)
-- 일반 사용자는 INSERT 불가, Service Role만 가능
-- (따라서 INSERT 정책은 추가하지 않음)

-- 4. Admin은 모든 프로필 업데이트 가능
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5. 사용자는 자신의 프로필만 업데이트 가능
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- 6. Admin은 프로필 삭제 가능
CREATE POLICY "Admins can delete profiles"
ON profiles FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

**검증**:
- [ ] Supabase Dashboard → Authentication → Policies에서 정책 확인
- [ ] 정책 수: 6개

#### Step 1.7.3: courses 테이블 RLS 정책

- [ ] 다음 SQL 실행:

```sql
-- ============================================
-- RLS Policies: courses
-- ============================================

-- 1. Admin은 모든 과정 조회 가능 (삭제된 것 포함)
CREATE POLICY "Admins can view all courses"
ON courses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 2. Instructor는 본인 과정만 조회 (삭제되지 않은 것만)
CREATE POLICY "Instructors can view own courses"
ON courses FOR SELECT
USING (
  instructor_id = auth.uid() AND is_deleted = false
);

-- 3. Admin은 과정 생성 가능
CREATE POLICY "Admins can insert courses"
ON courses FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 4. Admin은 모든 과정 수정 가능
CREATE POLICY "Admins can update courses"
ON courses FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5. Admin은 과정 삭제 가능 (실제로는 소프트 삭제로 구현)
CREATE POLICY "Admins can delete courses"
ON courses FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

**검증**:
- [ ] 정책 수: 5개

#### Step 1.7.4: links 테이블 RLS 정책

- [ ] 다음 SQL 실행:

```sql
-- ============================================
-- RLS Policies: links
-- ============================================

-- 1. Admin은 모든 링크 조회 가능
CREATE POLICY "Admins can view all links"
ON links FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 2. Instructor는 본인 과정의 링크만 조회 (삭제되지 않은 과정의 링크)
CREATE POLICY "Instructors can view own course links"
ON links FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = links.course_id
      AND courses.instructor_id = auth.uid()
      AND courses.is_deleted = false
  )
);

-- 3. Admin과 Instructor 모두 링크 추가 가능 (본인 과정에만)
CREATE POLICY "Admins can insert links"
ON links FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Instructors can insert links to own courses"
ON links FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = links.course_id
      AND courses.instructor_id = auth.uid()
      AND courses.is_deleted = false
  )
);

-- 4. Admin은 모든 링크 수정 가능
CREATE POLICY "Admins can update all links"
ON links FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5. Instructor는 본인이 만든 링크만 수정 가능
CREATE POLICY "Instructors can update own links"
ON links FOR UPDATE
USING (
  created_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = links.course_id
      AND courses.instructor_id = auth.uid()
      AND courses.is_deleted = false
  )
);

-- 6. Admin은 모든 링크 삭제 가능
CREATE POLICY "Admins can delete all links"
ON links FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 7. Instructor는 본인이 만든 링크만 삭제 가능
CREATE POLICY "Instructors can delete own links"
ON links FOR DELETE
USING (
  created_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM courses
    WHERE courses.id = links.course_id
      AND courses.instructor_id = auth.uid()
      AND courses.is_deleted = false
  )
);
```

**검증**:
- [ ] 정책 수: 7개

---

### 1-8. 데이터베이스 구축 테스트

**목표**: 테이블, 트리거, 함수, RLS 정책 통합 테스트

#### Step 1.8.1: 테스트 데이터 준비

**주의**: 아직 인증 시스템이 구축되지 않았으므로, Supabase Dashboard에서 Service Role을 사용하여 테스트 데이터 삽입

- [ ] 테스트용 Admin 사용자 생성 (Supabase Dashboard → Authentication → Users → Add User)
  - Email: admin@test.com
  - Password: test1234! (임시)
  - Email Confirmed: Yes

- [ ] SQL Editor에서 profiles에 Admin 프로필 추가:
  ```sql
  INSERT INTO profiles (id, email, role, name)
  VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@test.com'),
    'admin@test.com',
    'admin',
    'Test Admin'
  );
  ```

- [ ] 테스트용 Instructor 사용자 생성
  - Email: instructor@test.com
  - Password: test1234!
  - Email Confirmed: Yes

- [ ] Instructor 프로필 추가:
  ```sql
  INSERT INTO profiles (id, email, role, name)
  VALUES (
    (SELECT id FROM auth.users WHERE email = 'instructor@test.com'),
    'instructor@test.com',
    'instructor',
    'Test Instructor'
  );
  ```

#### Step 1.8.2: courses 테스트 데이터 삽입

- [ ] 테스트 과정 추가:
  ```sql
  INSERT INTO courses (client_name, instructor_id, instructor_email, education_date, status, memo, created_by)
  VALUES
  (
    'A사',
    (SELECT id FROM profiles WHERE email = 'instructor@test.com'),
    'instructor@test.com',
    CURRENT_DATE + INTERVAL '7 days',  -- 7일 후 (교육 전)
    'before',
    '초급 과정 테스트',
    (SELECT id FROM profiles WHERE email = 'admin@test.com')
  ),
  (
    'B사',
    (SELECT id FROM profiles WHERE email = 'instructor@test.com'),
    'instructor@test.com',
    CURRENT_DATE,  -- 오늘 (교육 중)
    'ongoing',
    '중급 과정 테스트',
    (SELECT id FROM profiles WHERE email = 'admin@test.com')
  ),
  (
    'C사',
    (SELECT id FROM profiles WHERE email = 'instructor@test.com'),
    'instructor@test.com',
    CURRENT_DATE - INTERVAL '7 days',  -- 7일 전 (교육 완료)
    'completed',
    '고급 과정 테스트',
    (SELECT id FROM profiles WHERE email = 'admin@test.com')
  );
  ```

#### Step 1.8.3: 자동 상태 업데이트 함수 테스트

- [ ] 함수 실행:
  ```sql
  SELECT update_course_status();
  ```

- [ ] 결과 확인:
  ```sql
  SELECT id, client_name, education_date, status FROM courses;
  ```

**예상 결과**:
- A사: status = 'before'
- B사: status = 'ongoing'
- C사: status = 'completed'

#### Step 1.8.4: 소프트 삭제 및 자동 영구 삭제 테스트

- [ ] 과정 소프트 삭제:
  ```sql
  UPDATE courses
  SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP - INTERVAL '16 days'
  WHERE client_name = 'C사';
  ```

- [ ] 자동 삭제 함수 실행:
  ```sql
  SELECT delete_old_trash();
  ```

- [ ] 결과 확인 (C사 과정이 영구 삭제되어야 함):
  ```sql
  SELECT * FROM courses WHERE client_name = 'C사';
  -- 결과: 0 rows
  ```

#### Step 1.8.5: RLS 정책 테스트

**중요**: RLS 정책은 Service Role이 아닌 일반 사용자 세션에서만 적용됩니다.
Supabase Dashboard의 SQL Editor는 Service Role을 사용하므로 RLS를 우회합니다.

따라서 RLS 테스트는 **Phase 1의 인증 시스템 구현 후** 클라이언트에서 테스트해야 합니다.

**임시 확인**:
- [ ] 정책 목록 확인:
  ```sql
  SELECT schemaname, tablename, policyname, permissive, roles, cmd
  FROM pg_policies
  WHERE tablename IN ('profiles', 'courses', 'links')
  ORDER BY tablename, policyname;
  ```

**검증 기준**: 총 18개 정책 (profiles: 6, courses: 5, links: 7)

---

## 🔐 Task 2: 인증 시스템 구현 (1-2일)

### 2-1. Supabase Auth 설정

**목표**: Supabase 인증 프로바이더 설정 및 이메일 템플릿 구성

#### Step 2.1.1: Email Provider 활성화

- [ ] Supabase Dashboard → Authentication → Providers
- [ ] Email Provider 확인 (기본적으로 활성화되어 있음)
- [ ] 설정 확인:
  - Enable Email provider: ✅
  - Confirm email: ✅ (이메일 확인 필수로 설정)
  - Secure email change: ✅

#### Step 2.1.2: Magic Link 설정 (강사 로그인용)

- [ ] Authentication → Providers → Email
- [ ] Magic Link 섹션:
  - Enable Magic Link: ✅
  - Magic Link 유효 시간: 3600초 (1시간, 기본값)

#### Step 2.1.3: Redirect URLs 설정

- [ ] Authentication → URL Configuration
- [ ] Site URL: `http://localhost:3000` (개발 환경)
- [ ] Redirect URLs 추가:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/admin/dashboard`
  - `http://localhost:3000/instructor/dashboard`

**나중에 배포 시 추가**:
- `https://your-domain.com/auth/callback`
- `https://your-domain.com/admin/dashboard`
- `https://your-domain.com/instructor/dashboard`

#### Step 2.1.4: Email Templates 커스터마이징

- [ ] Authentication → Email Templates
- [ ] Confirm signup 템플릿 수정 (선택):
  ```html
  <h2>LinkDump 가입을 환영합니다!</h2>
  <p>아래 링크를 클릭하여 이메일을 인증해주세요:</p>
  <p><a href="{{ .ConfirmationURL }}">이메일 확인</a></p>
  ```

- [ ] Magic Link 템플릿 수정:
  ```html
  <h2>LinkDump 로그인</h2>
  <p>아래 링크를 클릭하여 로그인하세요:</p>
  <p><a href="{{ .ConfirmationURL }}">로그인하기</a></p>
  <p>이 링크는 1시간 동안 유효합니다.</p>
  ```

**검증**:
- [ ] 테스트 이메일 발송 (Authentication → Users → Send test email)

---

### 2-2. TypeScript 타입 정의

**목표**: 데이터베이스 스키마에 맞는 TypeScript 타입 생성

#### Step 2.2.1: database.ts 파일 생성

- [ ] 파일 생성: `src/types/database.ts`
- [ ] 다음 코드 작성:

```typescript
// src/types/database.ts

/**
 * Supabase Database Types
 * 데이터베이스 스키마에 맞춘 TypeScript 타입 정의
 */

export type UserRole = 'admin' | 'instructor';

export type CourseStatus = 'before' | 'ongoing' | 'completed';

/**
 * Profiles 테이블
 */
export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  name: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Courses 테이블
 */
export interface Course {
  id: string;
  client_name: string;
  instructor_id: string | null;
  instructor_email: string;
  education_date: string;
  status: CourseStatus;
  memo: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Links 테이블
 */
export interface Link {
  id: string;
  course_id: string;
  title: string;
  url: string;
  category: string | null;
  created_by: string | null;
  is_admin_created: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Course with instructor profile (JOIN)
 */
export interface CourseWithInstructor extends Course {
  instructor_profile?: Profile;
}

/**
 * Link with creator profile (JOIN)
 */
export interface LinkWithCreator extends Link {
  creator_profile?: Profile;
}

/**
 * Course with links count
 */
export interface CourseWithLinkCount extends Course {
  total_links: number;
  admin_links: number;
  instructor_links: number;
}

/**
 * Database Response Types
 */
export type DbResult<T> = T | null;
export type DbResultArray<T> = T[];
```

**검증**:
- [ ] TypeScript 컴파일 에러 없는지 확인

#### Step 2.2.2: Supabase 자동 타입 생성 (선택)

Supabase CLI를 사용하면 데이터베이스에서 자동으로 타입을 생성할 수 있습니다.

- [ ] Supabase CLI 설치 (선택):
  ```bash
  npm install -g supabase
  ```

- [ ] 로그인:
  ```bash
  supabase login
  ```

- [ ] 타입 생성:
  ```bash
  supabase gen types typescript --project-id "your-project-id" > src/types/supabase.ts
  ```

**참고**: 수동으로 작성한 `database.ts`가 더 간단하고 커스터마이징하기 쉬우므로, 필수는 아닙니다.

---

### 2-3. Supabase 클라이언트 설정

**목표**: 클라이언트 및 서버 컴포넌트에서 사용할 Supabase 클라이언트 생성

#### Step 2.3.1: 클라이언트 사이드 Supabase 클라이언트

- [ ] 파일 생성: `src/lib/supabase/client.ts`
- [ ] 다음 코드 작성:

```typescript
// src/lib/supabase/client.ts

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';

/**
 * 클라이언트 컴포넌트에서 사용하는 Supabase 클라이언트
 * 브라우저 환경에서 실행됨
 */
export const createClient = () => {
  return createClientComponentClient<Database>();
};
```

#### Step 2.3.2: 서버 사이드 Supabase 클라이언트

- [ ] 파일 생성: `src/lib/supabase/server.ts`
- [ ] 다음 코드 작성:

```typescript
// src/lib/supabase/server.ts

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/**
 * 서버 컴포넌트에서 사용하는 Supabase 클라이언트
 * 서버 환경에서 실행됨
 */
export const createClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
};
```

#### Step 2.3.3: Route Handler용 Supabase 클라이언트

- [ ] 파일 생성: `src/lib/supabase/route.ts`
- [ ] 다음 코드 작성:

```typescript
// src/lib/supabase/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/**
 * Route Handler (API Routes)에서 사용하는 Supabase 클라이언트
 */
export const createClient = () => {
  const cookieStore = cookies();
  return createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  });
};
```

**검증**:
- [ ] TypeScript 에러 없는지 확인

---

### 2-4. 인증 컨텍스트 구현

**목표**: 사용자 인증 상태 및 프로필 관리를 위한 React Context 생성

#### Step 2.4.1: AuthContext 생성

- [ ] 파일 생성: `src/lib/auth/auth-context.tsx`
- [ ] 다음 코드 작성:

```typescript
// src/lib/auth/auth-context.tsx

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // 프로필 조회 함수
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  };

  // 프로필 새로고침
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  // 로그아웃
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // 초기 세션 확인
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 인증 상태 변경 감지
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// useAuth 훅
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

#### Step 2.4.2: Root Layout에 AuthProvider 추가

- [ ] 파일 수정: `src/app/layout.tsx`

```typescript
// src/app/layout.tsx

import { AuthProvider } from '@/lib/auth/auth-context';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

**검증**:
- [ ] 앱 실행 후 콘솔 에러 없는지 확인

---

### 2-5. 미들웨어 설정 (라우트 보호)

**목표**: 인증되지 않은 사용자 리다이렉트 및 역할 기반 접근 제어

#### Step 2.5.1: 미들웨어 파일 생성

- [ ] 파일 생성: `src/middleware.ts`
- [ ] 다음 코드 작성:

```typescript
// src/middleware.ts

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 인증이 필요한 경로
  const protectedPaths = ['/admin', '/instructor'];
  const isProtectedPath = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  // 인증되지 않은 사용자가 보호된 경로 접근 시 로그인 페이지로 리다이렉트
  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 역할 기반 접근 제어
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // Admin 전용 경로
    if (req.nextUrl.pathname.startsWith('/admin') && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/instructor/dashboard', req.url));
    }

    // Instructor 전용 경로
    if (
      req.nextUrl.pathname.startsWith('/instructor') &&
      profile?.role !== 'instructor'
    ) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/instructor/:path*',
    '/api/:path*',
  ],
};
```

**검증**:
- [ ] 미들웨어 적용 경로 확인

---

### 2-6. 로그인 페이지 구현

**목표**: Admin 및 Instructor 로그인 UI 및 로직 구현

#### Step 2.6.1: 로그인 페이지 라우트 생성

- [ ] 디렉토리 생성: `src/app/(auth)/login`
- [ ] 파일 생성: `src/app/(auth)/login/page.tsx`

#### Step 2.6.2: 로그인 페이지 UI 구현

- [ ] `src/app/(auth)/login/page.tsx` 작성:

```typescript
// src/app/(auth)/login/page.tsx

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loginMode, setLoginMode] = useState<'admin' | 'instructor'>('admin');

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  const supabase = createClient();

  // Admin 로그인 (이메일 + 비밀번호)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // 프로필 확인 (역할이 admin인지 검증)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Admin 계정만 로그인할 수 있습니다.');
      }

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Instructor 로그인 (매직 링크)
  const handleInstructorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setMessage('이메일로 로그인 링크를 발송했습니다. 이메일을 확인해주세요.');
    } catch (err: any) {
      setError(err.message || '로그인 링크 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            LinkDump 로그인
          </h2>
        </div>

        {/* 로그인 모드 선택 */}
        <div className="flex gap-2">
          <button
            onClick={() => setLoginMode('admin')}
            className={`flex-1 py-2 px-4 rounded-md ${
              loginMode === 'admin'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            운영진
          </button>
          <button
            onClick={() => setLoginMode('instructor')}
            className={`flex-1 py-2 px-4 rounded-md ${
              loginMode === 'instructor'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            강사
          </button>
        </div>

        {/* Admin 로그인 폼 */}
        {loginMode === 'admin' && (
          <form onSubmit={handleAdminLogin} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        )}

        {/* Instructor 로그인 폼 */}
        {loginMode === 'instructor' && (
          <form onSubmit={handleInstructorLogin} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            {message && (
              <div className="text-green-600 text-sm">{message}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '발송 중...' : '로그인 링크 받기'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
```

#### Step 2.6.3: Auth Callback 페이지 생성

Magic Link 클릭 후 리다이렉트를 처리하는 페이지

- [ ] 파일 생성: `src/app/auth/callback/route.ts`

```typescript
// src/app/auth/callback/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    await supabase.auth.exchangeCodeForSession(code);

    // 사용자 프로필 조회
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      // 역할에 따라 리다이렉트
      if (profile?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } else if (profile?.role === 'instructor') {
        return NextResponse.redirect(new URL('/instructor/dashboard', request.url));
      }
    }
  }

  // 기본 리다이렉트
  return NextResponse.redirect(new URL('/login', request.url));
}
```

**검증**:
- [ ] 로그인 페이지 접근: `http://localhost:3000/login`
- [ ] UI 정상 렌더링 확인

---

### 2-7. 임시 대시보드 페이지 생성 (테스트용)

**목표**: 로그인 후 리다이렉트 확인을 위한 최소 대시보드 페이지

#### Step 2.7.1: Admin 대시보드

- [ ] 파일 생성: `src/app/(admin)/admin/dashboard/page.tsx`

```typescript
// src/app/(admin)/admin/dashboard/page.tsx

'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="p-8">로딩 중...</div>;
  }

  if (!user || profile?.role !== 'admin') {
    router.push('/login');
    return null;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin 대시보드</h1>
      <p className="mt-4">환영합니다, {profile.name || profile.email}님!</p>
      <button
        onClick={signOut}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
      >
        로그아웃
      </button>
    </div>
  );
}
```

#### Step 2.7.2: Instructor 대시보드

- [ ] 파일 생성: `src/app/(instructor)/instructor/dashboard/page.tsx`

```typescript
// src/app/(instructor)/instructor/dashboard/page.tsx

'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';

export default function InstructorDashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="p-8">로딩 중...</div>;
  }

  if (!user || profile?.role !== 'instructor') {
    router.push('/login');
    return null;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">강사 대시보드</h1>
      <p className="mt-4">환영합니다, {profile.name || profile.email}님!</p>
      <button
        onClick={signOut}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
      >
        로그아웃
      </button>
    </div>
  );
}
```

**검증**:
- [ ] 대시보드 페이지 접근 시 로그인 페이지로 리다이렉트 확인

---

## ✅ Phase 1 통합 테스트

### 테스트 체크리스트

#### 데이터베이스 테스트
- [ ] Supabase Dashboard에서 3개 테이블 생성 확인
- [ ] 인덱스 및 트리거 설정 확인
- [ ] RLS 정책 총 18개 생성 확인
- [ ] `update_course_status()` 함수 정상 동작
- [ ] `delete_old_trash()` 함수 정상 동작

#### 인증 테스트 - Admin
- [ ] Admin 이메일+비밀번호 로그인 성공
- [ ] Admin 대시보드 접근 성공
- [ ] Admin이 Instructor 경로 접근 시 리다이렉트 확인
- [ ] 로그아웃 후 재접근 시 로그인 페이지로 리다이렉트

#### 인증 테스트 - Instructor
- [ ] Instructor 매직 링크 이메일 발송 성공
- [ ] 매직 링크 클릭 후 로그인 성공
- [ ] Instructor 대시보드 접근 성공
- [ ] Instructor가 Admin 경로 접근 시 리다이렉트 확인

#### RLS 정책 테스트 (클라이언트에서)
- [ ] Admin이 모든 courses 조회 가능
- [ ] Instructor가 본인 courses만 조회 가능
- [ ] Admin이 courses 생성/수정/삭제 가능
- [ ] Instructor가 courses 생성/수정 불가
- [ ] Admin이 모든 links 조회/수정/삭제 가능
- [ ] Instructor가 본인 과정의 links만 조회 가능
- [ ] Instructor가 본인이 만든 links만 수정/삭제 가능

---

## 📝 Phase 1 완료 기준

### 필수 완료 사항
✅ Supabase 데이터베이스 구축 완료
- profiles, courses, links 테이블 생성
- RLS 정책 설정 (18개)
- 자동화 함수 및 스케줄러 설정

✅ 인증 시스템 구축 완료
- Admin 로그인 (이메일+비밀번호)
- Instructor 로그인 (매직 링크)
- 역할 기반 라우트 보호
- Auth Context 및 미들웨어

✅ 통합 테스트 완료
- 모든 테스트 케이스 통과

### 다음 단계 (Phase 2)
- Admin 대시보드 UI 구현
- 과정 CRUD 기능 구현
- 링크 관리 기능 구현

---

## 🛠 트러블슈팅

### 일반적인 문제

#### 1. RLS 정책이 적용되지 않음
**원인**: Service Role로 쿼리를 실행하면 RLS를 우회함
**해결**: 클라이언트에서 anon key로 테스트

#### 2. Magic Link가 발송되지 않음
**원인**: Supabase 이메일 설정 문제
**해결**: Authentication → Email Templates에서 SMTP 설정 확인

#### 3. 미들웨어에서 프로필 조회 실패
**원인**: 비동기 처리 문제
**해결**: `await`를 제대로 사용했는지 확인

#### 4. TypeScript 타입 에러
**원인**: database.ts 타입 정의와 실제 스키마 불일치
**해결**: Supabase에서 자동 생성한 타입 사용 또는 수동으로 타입 수정

---

## 📚 참고 자료

- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)

---

**작성일**: 2024-11-21
**Phase 1 예상 소요 시간**: 2-3일
**다음 Phase**: Phase 2 - Admin 핵심 기능 구현
