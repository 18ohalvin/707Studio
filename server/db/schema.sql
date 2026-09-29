-- 707 Activation Builder PostgreSQL Schema
-- Multi-tenant schema supporting 20 brand accounts, page revisions, global templates, and submissions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Brands Table (Multi-tenant isolation)
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    primary_color VARCHAR(30) DEFAULT '#000000',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Global Presets / Templates (Managed by Head of UI/UX)
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'raffle', -- 'raffle', 'rsvp', 'hype_drop', 'lookbook', 'custom'
    thumbnail_url TEXT,
    widget_tree JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_global_preset BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(100) DEFAULT 'Head of UI/UX',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Activation Pages Table
CREATE TYPE page_status AS ENUM ('draft', 'pending_review', 'approved', 'published', 'archived');

CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    description TEXT,
    status page_status NOT NULL DEFAULT 'draft',
    current_version INT NOT NULL DEFAULT 1,
    widget_tree JSONB NOT NULL DEFAULT '[]'::jsonb,
    page_settings JSONB NOT NULL DEFAULT '{
        "seoTitle": "",
        "seoDescription": "",
        "ogImage": "",
        "favicon": "",
        "theme": "the-707-standard"
    }'::jsonb,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_brand_page_slug UNIQUE (brand_id, slug)
);

-- 4. Page Revision History & Approval Log
CREATE TABLE IF NOT EXISTS page_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    version INT NOT NULL,
    widget_tree JSONB NOT NULL,
    status page_status NOT NULL,
    submitted_by VARCHAR(100),
    review_notes TEXT,
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Submissions Table (Sneaker Raffles, RSVPs, Registrations)
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    submission_type VARCHAR(50) NOT NULL DEFAULT 'raffle', -- 'raffle', 'rsvp', 'general'
    form_data JSONB NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(50) DEFAULT 'submitted', -- 'submitted', 'winner', 'waitlist', 'checked_in'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal lookup & high-speed querying
CREATE INDEX IF NOT EXISTS idx_pages_brand_slug ON pages(brand_id, slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_submissions_page_id ON submissions(page_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
