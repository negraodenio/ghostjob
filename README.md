# GhostJob - AI-Powered Job Application Platform

Stop applying to ghost jobs. Get AI-powered job analysis, tailored CVs, cover letters, and interview prep.

## 🚀 Features

- **👻 Ghost Job Detection**: AI analyzes 15+ red flags to identify fake job postings
- **📄 Smart CV Builder**: ATS-optimized resumes tailored to each job
- **✉️ Cover Letter Generator**: Personalized cover letters with tone selection
- **🎤 Mock Interview**: AI-powered interview practice with instant feedback
- **📊 Application Dashboard**: Track all your analyses in one place
- **🌐 Ghost Wall**: Public feed of ghost job detections

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: SiliconFlow (DeepSeek) + OpenRouter (fallback)
- **Payments**: Stripe
- **Deployment**: Vercel

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account and project
- SiliconFlow API key (primary LLM)
- OpenRouter API key (fallback LLM)
- Stripe account for payments

## ⚙️ Setup Instructions

### 1. Clone and Install

```bash
cd c:\Users\denio\Documents\Denio\GhostJob
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API to get your keys
3. Go to SQL Editor and run the migrations:
   - Run `supabase/migrations/001_initial_schema.sql`
   - Run `supabase/migrations/002_rls_policies.sql`
4. Enable Google OAuth (optional):
   - Go to Authentication → Providers
   - Enable Google and configure OAuth credentials

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Providers
SILICONFLOW_API_KEY=your-siliconflow-api-key
SILICONFLOW_API_URL=https://api.siliconflow.com/v1
OPENROUTER_API_KEY=your-openrouter-api-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🗂️ Project Structure

```
GhostJob/
├── app/
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── analyze/           # Job analysis pages
│   ├── application/       # CV, cover letter, interview pages
│   ├── dashboard/         # User dashboard
│   ├── ghost-wall/        # Public ghost job feed
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── lib/
│   ├── llm.ts            # LLM abstraction layer
│   ├── rate-limit.ts     # Rate limiting logic
│   └── supabase/         # Supabase clients
├── components/           # Reusable components
├── supabase/
│   └── migrations/       # Database migrations
└── public/               # Static assets
```

## 🎨 Design System

- **Primary Color**: Purple (#8B5CF6)
- **Background**: Near Black (#0A0A0A)
- **Card Background**: Dark Gray (#141414)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Danger**: Red (#EF4444)
- **Ghost**: Ghost White (#E2E8F0)

## 📊 Database Schema

### Tables:
- `profiles` - User profiles and resume data
- `applications` - Job analyses with ghost scores
- `interview_sessions` - Mock interview transcripts
- `subscriptions` - Stripe subscription data
- `upvotes` - Ghost Wall upvotes

See `supabase/migrations/` for full schema.

## 🔐 Authentication

- Email/Password authentication
- Google OAuth (optional)
- Protected routes via middleware
- RLS policies on all tables

## 💳 Pricing Tiers

- **Free**: 3 analyses/month, 1 CV, basic interview prep
- **Pro ($9/mo)**: Unlimited analyses, CVs, cover letters, full interview prep
- **Premium ($19/mo)**: Everything + company research, salary negotiation, priority AI

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Supabase Setup

1. Run database migrations in Supabase SQL Editor
2. Configure auth providers
3. Set up RLS policies (already in migrations)

### Stripe Setup

1. Create products in Stripe Dashboard (Pro, Premium)
2. Configure webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Add webhook secret to environment variables

## 🧪 Testing

```bash
# Test ghost job analysis
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"job_description": "[your job description]"}'
```

## 📝 TODO

- [ ] Implement file parsing (PDF/DOCX resume upload)
- [ ] Add CV template designs
- [ ] Build mock interview chat interface
- [ ] Create Ghost Wall sharing functionality
- [ ] Implement Stripe checkout flow
- [ ] Add company research feature (Premium tier)
- [ ] Build salary negotiation guide

## 🤝 Contributing

This is a SaaS product. For feature requests or bug reports, contact the development team.

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For setup issues:
1. Check environment variables are correct
2. Verify Supabase migrations ran successfully
3. Ensure LLM API keys are valid
4. Check dev server logs for errors

---

**Built with AI. Made for job seekers.**
