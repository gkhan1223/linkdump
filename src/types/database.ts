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

/**
 * Supabase Database Type (for generic typing)
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      courses: {
        Row: Course;
        Insert: Omit<Course, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Course, 'id' | 'created_at' | 'updated_at'>>;
      };
      links: {
        Row: Link;
        Insert: Omit<Link, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Link, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
};
