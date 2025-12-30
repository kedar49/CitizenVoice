# Database Update Instructions

## ⚠️ IMPORTANT: Database Schema Updated

The database schema has been updated with robust CASCADE options to prevent deletion errors.

## How to Update Your Supabase Database

### Option 1: Fresh Setup (Recommended if you haven't added real data yet)

1. **Go to Supabase SQL Editor**

   - Open your Supabase project
   - Click "SQL Editor" in the left sidebar

2. **Drop existing tables** (this will delete all data):

   ```sql
   DROP TABLE IF EXISTS notifications CASCADE;
   DROP TABLE IF EXISTS votes CASCADE;
   DROP TABLE IF EXISTS questions CASCADE;
   DROP TABLE IF EXISTS categories CASCADE;
   DROP TABLE IF EXISTS users CASCADE;
   ```

3. **Run the new schema**:
   - Copy the entire contents of `schema.sql`
   - Paste into SQL Editor
   - Click "Run"

### Option 2: Update Existing Database (if you have important data)

Run these ALTER commands to add CASCADE options:

```sql
-- Update foreign key constraints to CASCADE
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_id_fkey,
  ADD CONSTRAINT users_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE questions
  DROP CONSTRAINT IF EXISTS questions_user_id_fkey,
  ADD CONSTRAINT questions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE questions
  DROP CONSTRAINT IF EXISTS questions_category_id_fkey,
  ADD CONSTRAINT questions_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

ALTER TABLE votes
  DROP CONSTRAINT IF EXISTS votes_question_id_fkey,
  ADD CONSTRAINT votes_question_id_fkey
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE;

ALTER TABLE votes
  DROP CONSTRAINT IF EXISTS votes_user_id_fkey,
  ADD CONSTRAINT votes_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_user_id_fkey,
  ADD CONSTRAINT notifications_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_question_id_fkey,
  ADD CONSTRAINT notifications_question_id_fkey
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE;
```

## Key Improvements

✅ **Cascade Delete**: When a user is deleted, all related data (questions, votes, notifications) is automatically deleted
✅ **Proper Indexes**: Added performance indexes on frequently queried columns
✅ **Security**: Enhanced RLS policies for better access control
✅ **Data Integrity**: Added check constraints for status and role fields
✅ **Timestamps**: Automatic `updated_at` tracking for questions and users

## Testing the Fix

After updating the schema, test user deletion:

1. Create a test account at `/auth/signin`
2. Submit a question
3. Vote on some questions
4. Go to Supabase → Authentication → Users
5. Delete the test user
6. ✅ Should delete without errors now!

## Troubleshooting

**If you still get errors:**

- Make sure you ran the schema with fresh DROP TABLE statements
- Check Supabase logs for specific constraint violations
- Verify all triggers are created properly

**To verify CASCADE is working:**

```sql
-- Check foreign key constraints
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';
```

All `delete_rule` should show `CASCADE` or `SET NULL`.
