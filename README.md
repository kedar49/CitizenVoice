# CitizenVoice - Parliamentary Democracy Platform

A modern platform for citizens to submit and vote on questions for Parliament, built with Next.js, Supabase, and TypeScript.

## 🚀 Features

### Core Features

- ✅ Submit questions to Parliament
- ✅ Vote on questions (real-time)
- ✅ Category-based organization
- ✅ Role-based access control (Citizen, MP Staff, Admin)
- ✅ Priority scoring algorithm

### Search & Discovery

- ✅ Full-text search
- ✅ Category filters with counts
- ✅ Multiple sort options (Priority, Recent, Votes, Trending)
- ✅ Smart empty states

### Notifications

- ✅ Real-time notification system
- ✅ Vote milestone celebrations (10, 50, 100, 500, 1000)
- ✅ Question status updates
- ✅ Role approval notifications

### Performance

- ✅ React Query for caching & optimistic updates
- ✅ Database indexes for 10x faster queries
- ✅ Skeleton loading states
- ✅ Request deduplication

### Security

- ✅ XSS protection with DOMPurify
- ✅ Row Level Security (RLS) on Supabase
- ✅ Input sanitization
- ✅ Error boundaries

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui + Radix UI
- **State Management:** React Query (TanStack Query)
- **Notifications:** Sonner
- **Authentication:** Supabase Auth
- **Animations:** Framer Motion

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account ([supabase.com](https://supabase.com))

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/kedar49/CitizenVoice.git

cd CitizenVoice
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project dashboard: **Settings → API**

### 4. Set up the database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the schema setup:
   - Copy contents of `schema.sql` → Execute
   - Copy contents of `notification_triggers.sql` → Execute

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts and add environment variables when asked
```

### Post-Deployment Checklist

- [ ] Verify Supabase connection
- [ ] Test authentication flow
- [ ] Check database RLS policies are working
- [ ] Verify real-time subscriptions work
- [ ] Test notification system
- [ ] Confirm search & filters work correctly

## 📊 Database Schema

### Main Tables

- `users` - User profiles and roles
- `questions` - Submitted questions
- `votes` - User votes on questions
- `categories` - Question categories
- `notifications` - User notifications
- `role_requests` - MP access requests

See `schema.sql` for complete schema and RLS policies.

## 📝 Key Features Implementation

### Search & Filters

- Client-side filtering for instant results
- Full-text search using PostgreSQL GIN indexes
- Category filtering with question counts
- 4 sort modes with custom algorithms

### Notification System

- Real-time via Supabase subscriptions
- Automatic triggers for milestones
- Mark as read/delete functionality
- Categorized by type with icons

### Performance Optimizations

- React Query caching (30s stale time)
- Optimistic updates for instant feedback
- Database indexes for fast queries
- Skeleton loaders for better UX

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Database by [Supabase](https://supabase.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

---

**Made with ❤️ for democracy**
