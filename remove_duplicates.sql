-- Remove Duplicate Questions SQL Script
-- Run this in Supabase SQL Editor to clean up duplicate questions

-- Step 1: View duplicates (run this first to see what will be deleted)
SELECT 
    title,
    COUNT(*) as duplicate_count,
    ARRAY_AGG(id ORDER BY created_at) as question_ids,
    MIN(created_at) as first_created
FROM questions
GROUP BY title
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Step 2: Delete duplicates, keeping only the oldest one
-- IMPORTANT: Review Step 1 results before running this!
WITH duplicates AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at ASC) as rn
    FROM questions
)
DELETE FROM questions
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- Step 3: Verify deletion (should return 0 rows)
SELECT 
    title,
    COUNT(*) as count
FROM questions
GROUP BY title
HAVING COUNT(*) > 1;

-- Optional: Add unique constraint to prevent future duplicates
-- WARNING: This will prevent users from submitting questions with identical titles
-- Uncomment the line below only if you want this behavior
-- ALTER TABLE questions ADD CONSTRAINT unique_question_title UNIQUE (title);
