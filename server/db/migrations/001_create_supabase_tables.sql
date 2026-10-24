-- ========================================================================
-- Muhammad Akram Portfolio & Visual Admin Studio
-- Migration: 001_create_supabase_tables.sql
-- Description: Complete production relational schema for Supabase PostgreSQL
-- ========================================================================

-- Enable UUID extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================================================
-- 1. USERS & AUTHENTICATION
-- ========================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL DEFAULT 'Muhammad Akram',
  role VARCHAR(50) NOT NULL DEFAULT 'super_admin',
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Active authenticated administrator sessions
CREATE TABLE IF NOT EXISTS sessions (
  token VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL DEFAULT 'super_admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions (expires_at);

-- ========================================================================
-- 2. GLOBAL PORTFOLIO SETTINGS & THEME
-- ========================================================================
CREATE TABLE IF NOT EXISTS portfolio_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title VARCHAR(255) NOT NULL DEFAULT 'Muhammad Akram — Full-Stack Developer & Creative Technologist',
  meta_description TEXT,
  theme_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  intro_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  custom_css TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================================
-- 3. SECTIONS & CANVAS ORDERING
-- ========================================================================
CREATE TABLE IF NOT EXISTS sections (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  custom_title VARCHAR(255),
  custom_subtitle VARCHAR(255),
  styles JSONB DEFAULT '{}'::jsonb,
  elements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sections_sort_order ON sections (sort_order);

-- ========================================================================
-- 4. HERO SECTION CONTENT
-- ========================================================================
CREATE TABLE IF NOT EXISTS hero_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  headline TEXT NOT NULL,
  tagline TEXT,
  roles JSONB NOT NULL DEFAULT '[]'::jsonb,
  short_bio TEXT,
  detailed_bio JSONB DEFAULT '[]'::jsonb,
  avatar_url TEXT,
  location VARCHAR(255),
  email VARCHAR(255),
  phone_placeholder VARCHAR(100),
  is_available BOOLEAN NOT NULL DEFAULT true,
  availability_note VARCHAR(255),
  socials JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================================
-- 5. ABOUT SECTION CONTENT
-- ========================================================================
CREATE TABLE IF NOT EXISTS about_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading VARCHAR(255) NOT NULL DEFAULT 'Engineering with Craft & Precision',
  narrative JSONB NOT NULL DEFAULT '[]'::jsonb,
  philosophy_quote TEXT,
  philosophy_author VARCHAR(255),
  stats JSONB NOT NULL DEFAULT '[]'::jsonb,
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================================
-- 6. SKILLS
-- ========================================================================
CREATE TABLE IF NOT EXISTS skills (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  proficiency INT NOT NULL DEFAULT 85,
  icon_name VARCHAR(100),
  is_featured BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON skills (category);
CREATE INDEX IF NOT EXISTS idx_skills_sort_order ON skills (sort_order);

-- ========================================================================
-- 7. SERVICES
-- ========================================================================
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
  tools JSONB NOT NULL DEFAULT '[]'::jsonb,
  icon_name VARCHAR(100),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_sort_order ON services (sort_order);

-- ========================================================================
-- 8. PROJECTS & PROJECT GALLERY
-- ========================================================================
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  category VARCHAR(100) NOT NULL DEFAULT 'Web Applications',
  short_description TEXT NOT NULL,
  full_description TEXT,
  image_url TEXT NOT NULL,
  live_url TEXT,
  github_url TEXT,
  technologies JSONB NOT NULL DEFAULT '[]'::jsonb,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  challenges TEXT,
  solutions TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_category ON projects (category);
CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON projects (sort_order);

CREATE TABLE IF NOT EXISTS project_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(100) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_gallery_project_id ON project_gallery (project_id);

-- ========================================================================
-- 9. EXPERIENCE
-- ========================================================================
CREATE TABLE IF NOT EXISTS experience (
  id VARCHAR(100) PRIMARY KEY,
  role VARCHAR(200) NOT NULL,
  company VARCHAR(200) NOT NULL,
  location VARCHAR(150),
  period VARCHAR(100) NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false,
  description TEXT NOT NULL,
  achievements JSONB NOT NULL DEFAULT '[]'::jsonb,
  technologies JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_experience_sort_order ON experience (sort_order);

-- ========================================================================
-- 10. CONTACT SETTINGS
-- ========================================================================
CREATE TABLE IF NOT EXISTS contact_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  direct_email VARCHAR(255) NOT NULL DEFAULT 'contact@muhammadakram.dev',
  availability_status VARCHAR(255) DEFAULT 'Available for Select Contracts & Full-time Roles',
  response_time VARCHAR(100) DEFAULT 'Within 24 Hours',
  booking_url TEXT,
  calendly_url TEXT,
  social_links JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================================
-- 11. NAVIGATION & FOOTER
-- ========================================================================
CREATE TABLE IF NOT EXISTS navigation_items (
  id VARCHAR(100) PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  href VARCHAR(255) NOT NULL,
  is_external BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_navigation_items_sort ON navigation_items (sort_order);

CREATE TABLE IF NOT EXISTS footer_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  copyright_text VARCHAR(255) NOT NULL DEFAULT '© 2026 Muhammad Akram. All rights reserved.',
  display_socials BOOLEAN NOT NULL DEFAULT true,
  back_to_top BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================================
-- 12. MEDIA VAULT & STORAGE METADATA
-- ========================================================================
CREATE TABLE IF NOT EXISTS media (
  id VARCHAR(100) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT,
  alt TEXT,
  alt_text TEXT,
  caption TEXT,
  description TEXT,
  media_type VARCHAR(50) NOT NULL DEFAULT 'image',
  mime_type VARCHAR(100),
  file_size VARCHAR(50),
  file_size_bytes BIGINT,
  dimensions VARCHAR(50),
  width INT,
  height INT,
  used_in JSONB NOT NULL DEFAULT '[]'::jsonb,
  source VARCHAR(50) NOT NULL DEFAULT 'upload',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_type ON media (media_type);

CREATE TABLE IF NOT EXISTS media_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id VARCHAR(100) NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  reference_path VARCHAR(255) NOT NULL,
  reference_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_references_media_id ON media_references (media_id);

-- ========================================================================
-- 13. DRAFTS & PUBLISHED REPOSITORY
-- ========================================================================
-- Draft state (Studio workspace)
CREATE TABLE IF NOT EXISTS drafts (
  id VARCHAR(100) PRIMARY KEY DEFAULT 'current_draft',
  data JSONB NOT NULL,
  last_saved_by VARCHAR(255),
  version INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Published state (Served to public visitors)
CREATE TABLE IF NOT EXISTS published_versions (
  id VARCHAR(100) PRIMARY KEY DEFAULT 'current_published',
  data JSONB NOT NULL,
  published_by VARCHAR(255),
  version INT NOT NULL DEFAULT 1,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Version History audit snapshots
CREATE TABLE IF NOT EXISTS version_history (
  id VARCHAR(100) PRIMARY KEY,
  version_number INT NOT NULL,
  label VARCHAR(255),
  data JSONB NOT NULL,
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_version_history_created_at ON version_history (created_at DESC);

-- ========================================================================
-- 14. AUDIT LOGS
-- ========================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,
  user_id VARCHAR(100),
  details JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(100),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp DESC);

-- ========================================================================
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================
-- Enable RLS on all tables to enforce security boundary
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE version_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Public can read ONLY the published version
DROP POLICY IF EXISTS "Public can read published version" ON published_versions;
CREATE POLICY "Public can read published version" ON published_versions
  FOR SELECT USING (true);

-- Public can read sections, projects, skills, services, experience, media if needed for public view
DROP POLICY IF EXISTS "Public can read sections" ON sections;
CREATE POLICY "Public can read sections" ON sections FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "Public can read projects" ON projects;
CREATE POLICY "Public can read projects" ON projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read skills" ON skills;
CREATE POLICY "Public can read skills" ON skills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read services" ON services;
CREATE POLICY "Public can read services" ON services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read experience" ON experience;
CREATE POLICY "Public can read experience" ON experience FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read media metadata" ON media;
CREATE POLICY "Public can read media metadata" ON media FOR SELECT USING (true);

-- CRITICAL: drafts, users, sessions, audit_logs, version_history HAVE NO PUBLIC ACCESS POLICIES.
-- Only the backend server holding the SUPABASE_SECRET_KEY (Service Role) can read/write them.

-- ========================================================================
-- 16. SUPABASE STORAGE BUCKET CONFIGURATION
-- ========================================================================
-- For portfolio media assets:
-- Run in Supabase SQL Editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-media', 'portfolio-media', true)
-- ON CONFLICT (id) DO NOTHING;
--
-- Recommended directory structure:
-- portfolio-media/hero/
-- portfolio-media/projects/
-- portfolio-media/gallery/
-- portfolio-media/skills/
-- portfolio-media/services/
-- portfolio-media/general/
