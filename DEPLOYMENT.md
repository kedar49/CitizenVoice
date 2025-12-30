# Deploying to Vercel - Quick Guide

## Prerequisites

- GitHub account
- Vercel account (free)
- Supabase project set up

## Step-by-Step Deployment

### 1. Prepare Your Code

Make sure all changes are committed:

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Connect to Vercel

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js settings

**Option B: Via Vercel CLI**

```bash
npm i -g vercel
vercel login
vercel
```

### 3. Configure Environment Variables

In Vercel project settings, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:**

- Get these from Supabase Dashboard → Settings → API
- ✅ Available for all environments (Production, Preview, Development)

### 4. Deploy

Click "Deploy" button or run:

```bash
vercel --prod
```

### 5. Post-Deployment Setup

#### A. Update Supabase Settings

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel domain to:
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:**
     - `https://your-app.vercel.app/auth/callback`
     - `https://your-app.vercel.app`

#### B. Test Core Features

- [ ] Sign in/Sign up works
- [ ] Questions load correctly
- [ ] Voting works (real-time updates)
- [ ] Search and filters functional
- [ ] Notifications appear
- [ ] Admin panel accessible (if admin)

#### C. Run Database Migrations

If you haven't already, run in Supabase SQL Editor:

1. `schema.sql` - Creates tables and indexes
2. `notification_triggers.sql` - Adds automatic notifications

## Troubleshooting

### Build Fails

**Error:** Module not found

```bash
# Locally, clear cache and rebuild
Remove-Item -Recurse -Force .next
npm run build
```

**Error:** Environment variables not found

- Verify they're added in Vercel project settings
- Redeploy after adding variables

### Authentication Issues

**Users can't sign in:**

1. Check Supabase URL configuration
2. Verify redirect URLs match your Vercel domain
3. Ensure RLS policies are enabled

### Real-time Not Working

- Supabase requires WebSocket connections
- Vercel supports WebSockets by default
- Check browser console for connection errors

### Slow Performance

- Enable Vercel Analytics (free)
- Check database indexes are created
- Verify React Query is properly configured

## Custom Domain (Optional)

### Add Your Domain

1. Vercel Dashboard → Project → Settings → Domains
2. Add your domain (e.g., `citizenvoice.com`)
3. Update DNS records as instructed
4. Update Supabase redirect URLs with new domain

## Monitoring & Analytics

### Vercel Analytics (Recommended)

```bash
npm install @vercel/analytics
```

Add to `layout.tsx`:

```tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Supabase Monitoring

- Dashboard → Database → Logs
- Monitor query performance
- Check real-time subscriptions

## Continuous Deployment

Vercel automatically deploys:

- ✅ Every push to `main` → Production
- ✅ Every PR → Preview deployment
- ✅ Comments on PR with preview URL

## Performance Optimization

### Enable Edge Runtime (Optional)

For faster global performance, add to `config`:

```ts
export const runtime = "edge";
```

### Image Optimization

Vercel optimizes images automatically. Use Next.js Image component:

```tsx
import Image from "next/image";
```

## Security Checklist

- [ ] Environment variables set correctly
- [ ] RLS policies enabled on all tables
- [ ] Supabase redirect URLs configured
- [ ] `.env.local` in `.gitignore`
- [ ] No API keys in code

## Cost Considerations

### Vercel Free Tier Includes:

- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS
- Preview deployments

### Supabase Free Tier Includes:

- 500MB database
- 1GB file storage
- 50,000 monthly active users
- 2GB bandwidth

Both are sufficient for most projects!

## Support

- **Vercel Issues:** [vercel.com/help](https://vercel.com/help)
- **Supabase Issues:** [supabase.com/docs](https://supabase.com/docs)
- **Next.js Issues:** [nextjs.org/docs](https://nextjs.org/docs)

---

🎉 **Your app is now live!** Share it with the world!
