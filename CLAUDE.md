# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LinkDump** - 교육 과정 통합 관리 대시보드

This is an education course management dashboard that allows operations staff (Admin) and instructors to manage course-related links, materials, and resources. The system features role-based access control, automatic course status management based on dates, and a soft-delete trash system with 15-day auto-purge.

### Key Users
- **Admin (운영진)**: Full control over all courses, links, and instructor assignments
- **Instructor (강사)**: View assigned courses and manage personal bookmarks/links

## Technology Stack

### Frontend
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui (Radix UI components)
- React Hook Form + Zod for validation
- date-fns for date handling

### Backend
- Supabase (BaaS)
  - PostgreSQL with Row Level Security (RLS)
  - Authentication (Email+Password for Admin, Magic Link for Instructors)
  - Realtime subscriptions
  - Automated cron jobs for status updates

### Deployment
- Frontend: Vercel
- Database: Supabase Cloud

## Database Architecture

### Core Schema (ERD)
```
auth.users (Supabase Auth)
  ↓ (1:1)
profiles
  ↓ (1:N)
courses
  ↓ (1:N)
links
```

### Tables

**profiles**
- Extends Supabase auth.users
- Fields: id, email, role ('admin' | 'instructor'), name
- Role-based access foundation

**courses**
- Education course information
- Fields: id, client_name, instructor_id, instructor_email, education_date, status, memo, is_deleted, deleted_at, created_by
- Status: 'before' | 'ongoing' | 'completed' (auto-updated daily via cron)
- Soft delete: is_deleted flag, auto-purge after 15 days

**links**
- Course-related bookmarks and resources
- Fields: id, course_id, title, url, category, created_by, is_admin_created
- CASCADE delete when parent course is deleted
- Category examples: '회의록', '수강생 공유자료', '가이드', '후속코칭 시트'

### Row Level Security (RLS) Policies

**Critical RLS Rules** (18 total policies):

**profiles** (6 policies):
- Users can view their own profile
- Admins can view all profiles
- Admins can update all profiles
- Users can update own profile
- Admins can delete profiles

**courses** (5 policies):
- Admins can view all courses (including deleted)
- Instructors can view only their own courses (non-deleted)
- Admins can insert/update/delete courses
- Instructors cannot modify courses

**links** (7 policies):
- Admins can view/update/delete all links
- Instructors can view links for their courses
- Instructors can insert links to their courses
- Instructors can update/delete only their own created links

**Important**: RLS policies only apply to client-side requests using the anon key. Service role queries bypass RLS.

### Automated Functions

**update_course_status()**
- Runs daily at midnight via cron/webhook
- Updates course.status based on education_date:
  - education_date > today → 'before'
  - education_date = today → 'ongoing'
  - education_date < today → 'completed'

**delete_old_trash()**
- Runs daily at 1 AM via cron/webhook
- Permanently deletes courses where is_deleted = true AND deleted_at > 15 days ago

## Authentication Architecture

### Admin Authentication
- Email + Password via Supabase Auth
- Login → Profile role verification → Redirect to /admin/dashboard
- Role check ensures only 'admin' role can access admin routes

### Instructor Authentication
- Magic Link (OTP) sent to email
- Click link → Auth callback → Redirect to /instructor/dashboard
- Simpler flow for instructors who don't need password management

### Auth Implementation

**Supabase Clients**:
- `src/lib/supabase/client.ts` - Client components (browser)
- `src/lib/supabase/server.ts` - Server components
- `src/lib/supabase/route.ts` - Route handlers (API routes)

**Auth Context**:
- `src/lib/auth/auth-context.tsx` - Provides useAuth() hook
- Manages user, profile, loading state
- Provides signOut(), refreshProfile() methods

**Middleware**:
- `src/middleware.ts` - Protects routes based on authentication and role
- Redirects unauthenticated users to /login
- Enforces role-based access: admins → /admin/*, instructors → /instructor/*

## Project Structure (Planned)

```
src/
├── app/
│   ├── (auth)/              # Auth route group
│   │   └── login/           # Unified login page (admin/instructor toggle)
│   ├── (admin)/             # Admin route group
│   │   ├── dashboard/       # Course grid view
│   │   ├── courses/[id]/    # Course detail + link management
│   │   └── trash/           # Soft-deleted courses (15-day recovery)
│   ├── (instructor)/        # Instructor route group
│   │   ├── dashboard/       # Own courses only
│   │   └── courses/[id]/    # Read-only course info + editable own links
│   ├── auth/callback/       # Magic link callback handler
│   └── middleware.ts        # Route protection
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── course/              # CourseCard, CourseFilter, CourseModal
│   ├── link/                # LinkList, LinkModal
│   └── layout/              # Header, Sidebar
├── lib/
│   ├── supabase/            # Supabase client factories
│   ├── auth/                # Auth context
│   ├── utils.ts             # Shared utilities
│   └── constants.ts         # Link categories, status colors
├── hooks/                   # Custom React hooks
├── types/
│   └── database.ts          # TypeScript types for DB schema
└── styles/                  # Global styles
```

## Development Workflow

### Phase-Based Development
This project follows a 7-phase development plan (see 기획.md and Phase1-세부계획.md):

**Phase 0**: Project setup (Next.js, Supabase, dependencies)
**Phase 1**: Database + Auth (current focus - see Phase1-세부계획.md for detailed steps)
**Phase 2**: Admin core features (course CRUD, link management, trash)
**Phase 3**: Instructor features
**Phase 4**: Advanced features (realtime, search, pagination)
**Phase 5**: UI/UX polish, testing
**Phase 6**: Deployment
**Phase 7**: Future enhancements (file uploads, email notifications, analytics)

### When Working on This Codebase

**Before implementing features**:
1. Check `기획.md` for the overall specification
2. Check phase-specific plans (e.g., `Phase1-세부계획.md`) for detailed steps
3. Verify current phase completion checklist

**Database changes**:
- All schema changes should be done via Supabase Dashboard SQL Editor
- Document migrations with comments (see Phase1-세부계획.md for SQL examples)
- Always update RLS policies after schema changes
- Test RLS policies from client-side, not SQL Editor (which uses service role)

**Authentication changes**:
- Modify Supabase Auth settings via Dashboard → Authentication
- Update redirect URLs in both Supabase and code
- Remember: Admin uses signInWithPassword(), Instructor uses signInWithOtp()

**Environment variables**:
- Never commit `.env.local`
- Always update `.env.example` when adding new variables
- Required variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Key Design Patterns

### Soft Delete Pattern
- Never hard delete courses directly
- Set `is_deleted = true` and `deleted_at = now()`
- Allow 15-day recovery via trash page
- Automated cleanup via `delete_old_trash()` function

### Status Auto-Update Pattern
- Don't manually set course status in most cases
- Let `update_course_status()` function handle it based on education_date
- Client can display computed status using date-fns for real-time accuracy

### Role-Based UI Pattern
- Use `useAuth()` hook to get user profile and role
- Conditionally render based on `profile?.role`
- Admin sees: edit/delete buttons, all courses, trash page
- Instructor sees: read-only course info, only own courses, can edit own links

### Link Ownership Pattern
- Admin-created links: `is_admin_created = true`
- Instructor-created links: `is_admin_created = false`, `created_by = instructor_id`
- UI distinction: Admin links shown with different background (read-only for instructors)
- Admins can edit/delete all links; Instructors only their own

## Important Implementation Notes

### Supabase Client Usage
- **Client components**: Use `createClient()` from `lib/supabase/client.ts`
- **Server components**: Use `createClient()` from `lib/supabase/server.ts` (requires cookies)
- **Route handlers**: Use `createClient()` from `lib/supabase/route.ts`
- Never use service_role key on client side

### RLS Testing
- RLS policies only apply to anon key requests
- Test via frontend/Postman, not Supabase SQL Editor
- SQL Editor uses service_role which bypasses RLS

### Magic Link Configuration
- Redirect URL must be added to Supabase Auth settings
- Email templates can be customized in Authentication → Email Templates
- Magic links expire in 1 hour (default)
- Handle callback in `app/auth/callback/route.ts`

### Course Status States
- 'before': Future course (education_date > today)
- 'ongoing': Current course (education_date = today)
- 'completed': Past course (education_date < today)
- Visual treatment: Completed courses shown with reduced opacity

### Link Categories
Standard categories (can be extended):
- 회의록 (Meeting notes)
- 수강생 공유자료 (Student materials)
- 가이드 (Guides)
- 후속코칭 시트 (Follow-up coaching)
- 기타 (Other)

## Testing Approach

### Database Testing
- Create test users via Supabase Dashboard → Authentication → Users
- Insert test profiles with admin/instructor roles
- Verify RLS policies by attempting operations as different users

### Auth Testing
- Admin login: Test email/password flow
- Instructor login: Test magic link flow (check email delivery)
- Test role-based redirects (admin → /admin/dashboard, instructor → /instructor/dashboard)
- Test unauthorized access (instructor accessing /admin should redirect)

### Automated Function Testing
- Manually trigger: `SELECT update_course_status();`
- Manually trigger: `SELECT delete_old_trash();`
- Verify results with SELECT queries
- Check Supabase logs for cron execution

## Design System

### Colors (Tailwind)
- Primary: Blue-500 (#3B82F6)
- Status colors:
  - Before (교육 전): Blue-100 bg, Blue-700 text
  - Ongoing (교육 중): Green-100 bg, Green-700 text
  - Completed (교육 완료): Gray-100 bg, Gray-500 text

### Layout
- Admin: Full sidebar navigation (Desktop: visible, Mobile: hamburger menu)
- Instructor: Simplified header only (no sidebar)
- Course cards: 5-column grid on desktop, responsive down to 1 column on mobile

### UI Components (shadcn/ui)
Install as needed:
```bash
npx shadcn-ui@latest add button card input label select dialog badge
npx shadcn-ui@latest add dropdown-menu calendar popover accordion
```

## Common Pitfalls

1. **RLS not working**: Ensure you're testing with anon key, not service_role
2. **Magic link not sending**: Check Supabase email settings and SMTP configuration
3. **Middleware infinite redirect**: Ensure proper role checks and base path handling
4. **Course status not updating**: Verify cron job is scheduled in Supabase
5. **Instructor can't add links**: Check RLS policy and course ownership
6. **Types mismatch**: Keep `types/database.ts` in sync with actual DB schema

## References

- Project specification: `기획.md`
- Phase 1 detailed plan: `Phase1-세부계획.md`
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
- Next.js Auth Helpers: https://supabase.com/docs/guides/auth/auth-helpers/nextjs
- shadcn/ui: https://ui.shadcn.com/
