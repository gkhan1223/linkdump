# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LinkDump** - 교육 과정 통합 관리 대시보드

Education course management dashboard for operations staff (Admin) and instructors to manage course-related links, materials, and resources. Features role-based access control, automatic course status management based on dates, and a soft-delete trash system with 15-day auto-purge.

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
  - Edge Functions for admin operations

### Deployment
- Frontend: Vercel (planned)
- Database: Supabase Cloud

## Development Commands

```bash
npm install                  # Install dependencies
npm run dev                  # Start development server (localhost:3000)
npm run build                # Build for production
npm run start                # Start production server
npm run lint                 # Run ESLint
```

**Database operations** (via Supabase MCP or Dashboard):
- SQL Editor: Execute migrations and queries
- Table Editor: View and manually edit data
- Authentication: Manage users and auth settings
- Database → Functions: Test automated functions manually
- Edge Functions: Deploy via MCP `mcp__supabase__deploy_edge_function`

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
- **Important**: All clients use `@supabase/ssr` package, NOT the deprecated `@supabase/auth-helpers-nextjs`
- **Important**: Clients do NOT use generic Database type (causes schema query errors)

**Auth Context**:
- `src/lib/auth/auth-context.tsx` - Provides useAuth() hook
- Manages user, profile, loading state
- Provides signOut(), refreshProfile() methods

**Middleware**:
- `src/middleware.ts` - Protects routes based on authentication and role
- Redirects unauthenticated users to /login
- Enforces role-based access: admins → /admin/*, instructors → /instructor/*

## Project Structure

### Current Implementation (Phase 2 Complete ✅)
```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx              ✅ Login page (admin/instructor toggle)
│   ├── (admin)/
│   │   ├── layout.tsx                ✅ Admin layout (header + sidebar)
│   │   └── admin/
│   │       ├── dashboard/page.tsx    ✅ Full admin dashboard with CRUD
│   │       ├── courses/[id]/page.tsx ✅ Course detail + link management
│   │       └── trash/page.tsx        ✅ Trash/recovery page
│   ├── (instructor)/
│   │   └── instructor/dashboard/
│   │       └── page.tsx              ✅ Instructor dashboard (placeholder)
│   ├── auth/callback/
│   │   └── route.ts                  ✅ Magic link callback handler
│   ├── layout.tsx                    ✅ Root layout with AuthProvider
│   └── page.tsx                      ✅ Home page
├── components/
│   ├── ui/                           ✅ shadcn/ui components (14 components)
│   ├── layout/
│   │   ├── AdminHeader.tsx           ✅ Admin header with user dropdown
│   │   └── AdminSidebar.tsx          ✅ Admin sidebar navigation
│   ├── course/
│   │   ├── CourseCard.tsx            ✅ Course card with status badge
│   │   ├── CourseFilter.tsx          ✅ Search, filter, sort
│   │   └── CourseModal.tsx           ✅ Course CRUD modal (RHF + Zod)
│   └── link/
│       ├── LinkList.tsx              ✅ Category-based accordion
│       └── LinkModal.tsx             ✅ Link CRUD modal
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 ✅ Client component Supabase client
│   │   ├── server.ts                 ✅ Server component Supabase client
│   │   └── route.ts                  ✅ Route handler Supabase client
│   ├── auth/
│   │   └── auth-context.tsx          ✅ Auth context provider
│   └── utils.ts                      ✅ cn() utility for Tailwind
├── types/
│   └── database.ts                   ✅ TypeScript types for DB schema
└── middleware.ts                     ✅ Route protection middleware

supabase/functions/
└── create-admin-user/                ✅ Edge Function for user creation
    └── index.ts
```

## Development Workflow

### Current Status: Phase 2 Complete ✅

**Phase 0**: ✅ Project setup (Next.js, Supabase, dependencies)
**Phase 1**: ✅ Database + Auth (see Phase1-세부계획.md)
**Phase 2**: ✅ Admin core features (see Phase2-세부계획.md)
  - Admin layout with header and sidebar
  - Dashboard with course cards, filtering, and search
  - Full course CRUD with soft delete
  - Course detail page with link management
  - Links organized by category with accordion UI
  - Trash functionality for restoring/permanently deleting courses
**Phase 3**: Instructor features (planned)
**Phase 4**: Advanced features (realtime, search, pagination) (planned)
**Phase 5**: UI/UX polish, testing (planned)
**Phase 6**: Deployment (planned)
**Phase 7**: Future enhancements (file uploads, email notifications, analytics) (planned)

### When Working on This Codebase

**Before implementing features**:
1. Check `기획.md` for the overall specification
2. Check phase-specific plans (e.g., `Phase1-세부계획.md`) for detailed steps
3. Verify current phase completion checklist

**Database changes**:
- All schema changes should be done via Supabase Dashboard SQL Editor or MCP
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

## Architecture Patterns

### Data Flow Pattern
```
Client Request → Middleware (Auth Check) → Page Component → Supabase Client → RLS → Database
                    ↓                                              ↓
              Role Check                                    RLS Policies Filter
                    ↓                                              ↓
         Redirect if unauthorized                        Return filtered data
```

**Key Points**:
- All database queries go through Supabase client (never direct SQL from client)
- Middleware intercepts protected routes BEFORE page render
- RLS policies provide defense-in-depth (even if middleware bypassed)
- Auth state managed globally via AuthContext, consumed via useAuth() hook

### Component Architecture Pattern

**Page Components** (app directory):
- Server-rendered by default in Next.js 14
- Mark as 'use client' only when using hooks (useState, useEffect, useAuth)
- Handle routing and data fetching coordination

**Feature Components** (components directory):
- Course components: Display and manage course data
- Link components: Display and manage link data
- Layout components: Headers, sidebars, navigation
- UI components: shadcn/ui primitives (button, card, dialog, etc.)

**Shared Logic**:
- Utility functions in `lib/utils.ts` (cn() for Tailwind class merging)
- Type definitions in `types/database.ts`

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
- **Critical**: Use `@supabase/ssr` package, NOT `@supabase/auth-helpers-nextjs`
- **Critical**: Do NOT use generic Database type in createClient (causes "Database error querying schema")

### Creating Admin/Instructor Users
**CRITICAL - NEVER CREATE USERS DIRECTLY IN auth.users TABLE**

Direct SQL insertion into `auth.users` causes authentication errors:
```
Error: sql: Scan error on column index 3, name "confirmation_token":
converting NULL to string is unsupported
```

**Correct method**: Use Supabase Admin API via Edge Function
```typescript
// Deploy and call the create-admin-user Edge Function
curl -X POST https://PROJECT_URL/functions/v1/create-admin-user \
  -H "Authorization: Bearer ANON_KEY"
```

Or use Supabase Dashboard → Authentication → Add User

**Why**: Supabase Auth requires specific field initialization (confirmation_token, encrypted_password, etc.) that can only be done correctly through the Auth API, not direct SQL.

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
All required components already installed:
- button, card, input, label, select, dialog, badge
- dropdown-menu, avatar, separator, accordion, toast, textarea

## Common Pitfalls

1. **Database error querying schema**: Remove generic Database type from Supabase clients
2. **Auth user creation fails**: Use Edge Function or Dashboard, NEVER direct SQL to auth.users
3. **RLS not working**: Ensure you're testing with anon key, not service_role
4. **Magic link not sending**: Check Supabase email settings and SMTP configuration
5. **Middleware infinite redirect**: Ensure proper role checks and base path handling
6. **Course status not updating**: Verify cron job is scheduled in Supabase
7. **Instructor can't add links**: Check RLS policy and course ownership
8. **Types mismatch**: Keep `types/database.ts` in sync with actual DB schema
9. **Build errors with @supabase/auth-helpers-nextjs**: Use `@supabase/ssr` instead

## Planning Documents

This project uses detailed phase-by-phase planning documents:

**기획.md** - Master specification
- Complete project specification with ERD, RLS policies, UI wireframes
- 7-phase development roadmap with timelines
- User scenarios for Admin and Instructor
- Contains ALL SQL migration code for database setup

**Phase1-세부계획.md** - Phase 1 implementation guide
- Step-by-step checklist with SQL code for database setup
- RLS policy implementation (18 policies with exact SQL)
- Authentication setup (Admin: email+password, Instructor: magic link)
- Code examples for all Supabase clients and auth context
- Troubleshooting section

**Phase2-세부계획.md** - Phase 2 implementation guide
- Admin dashboard UI implementation steps
- Course CRUD with React Hook Form + Zod validation
- Link management with category grouping (Accordion UI)
- Trash/recovery feature implementation
- Complete code examples for all components

**When starting a new phase**:
1. Read the phase-specific plan first (Phase1-세부계획.md, Phase2-세부계획.md, etc.)
2. Follow the numbered tasks and step-by-step checklists
3. Use the provided SQL and code examples exactly as written
4. Check off items as you complete them
5. Run verification steps after each major section

## References

- Project specification: `기획.md` (full spec, ERD, wireframes)
- Phase 1 plan: `Phase1-세부계획.md` (database + auth)
- Phase 2 plan: `Phase2-세부계획.md` (admin features)
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
- Supabase SSR: https://supabase.com/docs/guides/auth/server-side/nextjs
- shadcn/ui: https://ui.shadcn.com/
