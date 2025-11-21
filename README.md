# LinkDump - 교육 과정 통합 관리 대시보드

교육 과정별 링크(자료, 회의록 등)를 통합 관리하는 대시보드 시스템으로, 운영진(Admin)과 강사(Instructor)의 권한을 분리하고, 교육 일정에 따른 상태 자동화 및 데이터 관리 효율화를 목표로 합니다.

## 🎯 Phase 1 완료 항목

### 데이터베이스 구축 ✅
- **profiles 테이블**: 사용자 프로필 정보 (Admin/Instructor)
- **courses 테이블**: 교육 과정 정보 (소프트 삭제 지원)
- **links 테이블**: 과정별 링크 정보 (CASCADE 삭제)
- **자동화 함수**:
  - `update_course_status()`: 교육 날짜 기반 진행 상황 자동 업데이트
  - `delete_old_trash()`: 15일 이상 지난 휴지통 과정 영구 삭제
- **RLS 정책 18개**: profiles(6), courses(5), links(7)

### 인증 시스템 ✅
- **Admin 로그인**: 이메일 + 비밀번호
- **Instructor 로그인**: 매직 링크 (OTP)
- **역할 기반 접근 제어**: 미들웨어로 라우트 보호
- **인증 컨텍스트**: useAuth 훅 제공

## 🚀 시작하기

### 필수 사항
- Node.js 18+
- Supabase 계정 (https://supabase.com)
- Git

### 1. 환경 변수 설정

`.env.local` 파일을 프로젝트 루트에 생성하고 다음 내용을 추가하세요:

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 2. 패키지 설치

\`\`\`bash
npm install
\`\`\`

### 3. 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 열어 확인하세요.

## 📁 프로젝트 구조

\`\`\`
linkdump/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/               # 로그인 페이지
│   │   ├── (admin)/
│   │   │   └── admin/dashboard/     # Admin 대시보드
│   │   ├── (instructor)/
│   │   │   └── instructor/dashboard/# Instructor 대시보드
│   │   └── auth/callback/           # 매직 링크 콜백
│   ├── lib/
│   │   ├── supabase/                # Supabase 클라이언트
│   │   └── auth/                    # 인증 컨텍스트
│   ├── types/
│   │   └── database.ts              # TypeScript 타입 정의
│   └── middleware.ts                # 라우트 보호
├── .env.example
├── .gitignore
├── Phase1-세부계획.md
├── CLAUDE.md
└── 기획.md
\`\`\`

## 🗄 데이터베이스 스키마

### profiles
- 사용자 프로필 정보 (Supabase Auth 확장)
- 역할: `admin` | `instructor`

### courses
- 교육 과정 정보
- 상태: `before` | `ongoing` | `completed` (자동 업데이트)
- 소프트 삭제 지원 (15일 후 영구 삭제)

### links
- 과정별 링크 정보
- 카테고리별 분류 (회의록, 수강생 자료, 가이드 등)
- Admin/Instructor 생성 구분

## 🔐 인증 시스템

### Admin 로그인
- 이메일 + 비밀번호 방식
- `/admin/dashboard`로 리다이렉트

### Instructor 로그인
- 매직 링크 (이메일 OTP) 방식
- `/instructor/dashboard`로 리다이렉트

## 📋 다음 단계 (Phase 2)

- [ ] Admin 대시보드 UI 구현
- [ ] 과정 CRUD 기능 구현
- [ ] 링크 관리 기능 구현
- [ ] 휴지통 페이지 구현
- [ ] 필터링 및 검색 기능

## 🛠 기술 스택

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **인증**: Supabase Auth (Password + Magic Link)
- **배포**: Vercel (예정)

## 📚 참고 문서

- [프로젝트 기획서](./기획.md)
- [Phase 1 세부계획](./Phase1-세부계획.md)
- [Claude Code 가이드](./CLAUDE.md)
- [Supabase 문서](https://supabase.com/docs)
- [Next.js 문서](https://nextjs.org/docs)

## 👥 팀

- **개발**: LinkDump Team
- **Claude Code**: AI 코드 어시스턴트

---

**작성일**: 2025-01-21
**버전**: Phase 1 완료
