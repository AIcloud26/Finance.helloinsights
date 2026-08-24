-- ============================================================
-- HelloInsights Finance Content Studio V1.0
-- Supabase Database Schema
-- ============================================================

-- Articles table
CREATE TABLE articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    category TEXT,
    subcategory TEXT,
    content_type TEXT,
    excerpt TEXT,
    content TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft','review','approved','published')),
    author_id UUID,
    editorial_angle TEXT,
    author_view TEXT,
    key_points TEXT,
    editorial_notes TEXT,
    seo_title TEXT,
    meta_description TEXT,
    primary_keyword TEXT,
    secondary_keywords TEXT,
    image_alt TEXT,
    fact_check_status TEXT DEFAULT 'pending',
    quality_status TEXT DEFAULT 'pending',
    human_approved BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Article sources
CREATE TABLE article_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    source_name TEXT,
    source_url TEXT,
    source_type TEXT CHECK (source_type IN ('official','media','research','data','other')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Article versions
CREATE TABLE article_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT,
    title TEXT,
    change_type TEXT CHECK (change_type IN ('AI_GENERATED','HUMAN_EDIT','AI_REWRITE','FACT_CHECK_REVISION','FINAL_APPROVAL')),
    changed_by TEXT DEFAULT 'system',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Article reviews (fact check, quality)
CREATE TABLE article_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    review_type TEXT CHECK (review_type IN ('fact_check','quality','editorial')),
    status TEXT CHECK (status IN ('pending','in_progress','completed')),
    result TEXT,
    details JSONB DEFAULT '{}',
    reviewer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI generation logs
CREATE TABLE ai_generation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    operation TEXT CHECK (operation IN ('outline','draft','rebuild','paragraph_rewrite','fact_check','quality_review','seo','optimize')),
    model TEXT DEFAULT 'default',
    prompt_version TEXT DEFAULT 'v1',
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_updated ON articles(updated_at DESC);
CREATE INDEX idx_sources_article ON article_sources(article_id);
CREATE INDEX idx_versions_article ON article_versions(article_id);
CREATE INDEX idx_reviews_article ON article_reviews(article_id);
CREATE INDEX idx_ai_logs_article ON ai_generation_logs(article_id);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- Public read (for initial setup; replace with auth-based policies for production)
CREATE POLICY "public_read_articles" ON articles FOR SELECT USING (true);
CREATE POLICY "public_insert_articles" ON articles FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_articles" ON articles FOR UPDATE USING (true);
CREATE POLICY "public_delete_articles" ON articles FOR DELETE USING (true);

CREATE POLICY "public_read_sources" ON article_sources FOR SELECT USING (true);
CREATE POLICY "public_insert_sources" ON article_sources FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_sources" ON article_sources FOR UPDATE USING (true);
CREATE POLICY "public_delete_sources" ON article_sources FOR DELETE USING (true);

CREATE POLICY "public_read_versions" ON article_versions FOR SELECT USING (true);
CREATE POLICY "public_insert_versions" ON article_versions FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_versions" ON article_versions FOR UPDATE USING (true);
CREATE POLICY "public_delete_versions" ON article_versions FOR DELETE USING (true);

CREATE POLICY "public_read_reviews" ON article_reviews FOR SELECT USING (true);
CREATE POLICY "public_insert_reviews" ON article_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_reviews" ON article_reviews FOR UPDATE USING (true);
CREATE POLICY "public_delete_reviews" ON article_reviews FOR DELETE USING (true);

CREATE POLICY "public_read_logs" ON ai_generation_logs FOR SELECT USING (true);
CREATE POLICY "public_insert_logs" ON ai_generation_logs FOR INSERT WITH CHECK (true);
