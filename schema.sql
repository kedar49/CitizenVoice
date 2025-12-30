-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS role_requests CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (extends auth.users)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'citizen' CHECK (role IN ('citizen', 'mp_staff', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role Requests table (NEW - for approval-based role changes)
CREATE TABLE role_requests (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    requested_role TEXT NOT NULL CHECK (requested_role IN ('mp_staff', 'admin')),
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'merged', 'implemented')),
    vote_count INTEGER DEFAULT 0,
    priority_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes table
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(question_id, user_id)
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_questions_user_id ON questions(user_id);
CREATE INDEX idx_questions_category_id ON questions(category_id);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_votes_question_id ON votes(question_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_role_requests_user_id ON role_requests(user_id);
CREATE INDEX idx_role_requests_status ON role_requests(status);

-- Additional performance indexes
CREATE INDEX idx_questions_status_priority ON questions(status, priority_score DESC);
CREATE INDEX idx_questions_user_created ON questions(user_id, created_at DESC);
CREATE INDEX idx_votes_user_question ON votes(user_id, question_id);

-- Full-text search index
CREATE INDEX idx_search_questions ON questions USING gin(to_tsvector('english', title || ' ' || description));

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_requests ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles"
    ON users FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own profile"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Role Requests policies
CREATE POLICY "Users can view own role requests"
    ON role_requests FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    ));

CREATE POLICY "Users can create role requests"
    ON role_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update role requests"
    ON role_requests FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    ));

-- Questions policies
CREATE POLICY "Anyone can view questions"
    ON questions FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create questions"
    ON questions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own questions"
    ON questions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "MP staff can update any question"
    ON questions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('mp_staff', 'admin')
        )
    );

CREATE POLICY "Users can delete own questions"
    ON questions FOR DELETE
    USING (auth.uid() = user_id);

-- Votes policies
CREATE POLICY "Anyone can view votes"
    ON votes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can vote"
    ON votes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
    ON votes FOR DELETE
    USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Anyone can view categories"
    ON categories FOR SELECT
    USING (true);

-- Functions and Triggers

-- Function to update vote count and priority score
CREATE OR REPLACE FUNCTION update_question_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE questions
        SET 
            vote_count = vote_count + 1,
            priority_score = (vote_count + 1) * 10
        WHERE id = NEW.question_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE questions
        SET 
            vote_count = GREATEST(vote_count - 1, 0),
            priority_score = GREATEST(vote_count - 1, 0) * 10
        WHERE id = OLD.question_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for vote changes
DROP TRIGGER IF EXISTS trigger_update_question_metrics ON votes;
CREATE TRIGGER trigger_update_question_metrics
    AFTER INSERT OR DELETE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_question_metrics();

-- Function to create user profile on signup (FIXED)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role)
    VALUES (
        NEW.id, 
        COALESCE(NEW.email, NEW.raw_user_meta_data->>'email'),
        'citizen'
    )
    ON CONFLICT (id) DO UPDATE
    SET email = COALESCE(NEW.email, NEW.raw_user_meta_data->>'email');
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error creating user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for questions updated_at
DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for users updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, color, icon) VALUES
    ('Infrastructure', 'blue', 'building'),
    ('Healthcare', 'red', 'heart'),
    ('Education', 'green', 'book'),
    ('Economy', 'yellow', 'currency-dollar'),
    ('Environment', 'emerald', 'leaf')
ON CONFLICT (name) DO NOTHING;
