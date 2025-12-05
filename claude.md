# CLAUDE.md

This document contains essential information for working with the AI Image Generator template.
Follow these guidelines precisely.

## Core Development Commands

### Package Management
- Use `npm` or `pnpm` for package management
- Install dependencies: `npm install` or `pnpm install`
- Add new package: `npm install package-name` or `pnpm add package-name`
- Development server: `npm run dev` or `pnpm dev`
- Build production: `npm run build` or `pnpm build`
- Start production: `npm start` or `pnpm start`
- Lint code: `npm run lint` or `pnpm lint`

### Environment Setup
```bash
# Required environment variables in .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
REPLICATE_API_TOKEN=your_replicate_api_token
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRO_PRICE_ID=price_1RGUWjPQGnZtS6x2kTXR9cou
STRIPE_PREMIUM_PRICE_ID=price_1RGUWsPQGnZtS6x2Lt6Sgoyd
```

## Key Architecture Components

### Tech Stack
- **Framework**: Next.js 15.4 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: NextAuth.js (JWT strategy)
- **Database**: Supabase
- **AI Image Generation**: Replicate (Flux Schnell model)
- **Internationalization**: next-intl
- **Payment**: Stripe
- **Icons**: Lucide React + React Icons

### Core File Structure
```
src/
├── app/[locale]/              # Internationalized routes
│   ├── page.tsx              # Home page
│   ├── dashboard/            # User dashboard
│   │   └── page.tsx         # User account & subscription management
│   ├── history/             # Generation history
│   │   └── page.tsx         # User's generated images gallery
│   └── api/                 # API routes
│       ├── generate-image/  # Image generation endpoint
│       ├── history/         # User history API
│       │   └── route.ts     # GET user's generation history
│       ├── user/           # User management APIs
│       │   └── dashboard/   # Dashboard data
│       │       └── route.ts # GET user dashboard data
│       └── auth/           # NextAuth endpoints
├── components/
│   ├── sections/           # Page sections
│   │   ├── Header.tsx      # Navigation header
│   │   ├── Hero.tsx        # Hero section
│   │   ├── ToolSection.tsx # AI tool interface
│   │   ├── Features.tsx    # Feature showcase
│   │   ├── HowItWorks.tsx  # Usage steps
│   │   ├── WhyChooseUs.tsx # Value propositions
│   │   ├── Pricing.tsx     # Subscription plans
│   │   ├── CTA.tsx         # Call-to-action
│   │   ├── FAQ.tsx         # Questions section
│   │   └── Footer.tsx      # Site footer
│   ├── auth/               # Authentication components
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── supabase.ts         # Supabase client
│   ├── supabase-admin.ts   # Supabase admin client
│   └── db.ts               # Database operations
└── messages/               # Internationalization files
    ├── en.json             # English translations
    └── zh.json             # Chinese translations
```

### Essential Functions

#### Database Operations (`src/lib/db.ts`)
- `createUser(userData)` - Create new user profile
- `getUserByEmail(email)` - Fetch user by email
- `updateUserCredits(userId, credits)` - Update user credit balance
- `deductCredits(userId, amount)` - Deduct credits for image generation

#### Image Generation (`src/app/[locale]/api/generate-image/route.ts`)
- **Endpoint**: `POST /api/generate-image`
- **Model**: Replicate Flux Schnell (`black-forest-labs/flux-schnell`)
- **Cost**: 3 credits per image
- **Parameters**: prompt, aspect_ratio, num_outputs, num_inference_steps

#### User Dashboard (`src/app/[locale]/api/user/dashboard/route.ts`)
- **Endpoint**: `GET /api/user/dashboard`
- **Purpose**: Fetch user profile, credits, and subscription data
- **Returns**: User info, subscription status, plan details

#### Generation History (`src/app/[locale]/api/history/route.ts`)
- **Endpoint**: `GET /api/history?page=1&limit=20`
- **Purpose**: Retrieve user's generated images with pagination
- **Features**: Image gallery, download functionality, date filtering

#### Authentication (`src/lib/auth.ts`)
- **Strategy**: JWT (not database sessions)
- **Provider**: Google OAuth
- **Session**: Includes user id, email, credits

### Key Pages & Components

#### Home Page (`src/app/[locale]/page.tsx`)
- **Components**: Header, Hero, ToolSection, Features, HowItWorks, WhyChooseUs, Pricing, CTA, FAQ, Footer
- **Features**: AI image generation interface, Google login, pricing display
- **Routes**: `/` (English), `/zh` (Chinese)

#### Dashboard Page (`src/app/[locale]/dashboard/page.tsx`)
- **Purpose**: User account management and subscription overview
- **Features**: 
  - Current credit balance display
  - Active subscription details
  - Plan management (upgrade/downgrade)
  - Stripe Customer Portal integration
  - Subscription renewal dates
- **Access**: Protected route (authentication required)

#### History Page (`src/app/[locale]/history/page.tsx`)
- **Purpose**: Gallery of user's generated images
- **Features**:
  - Grid layout with image thumbnails
  - Pagination (12 images per page)
  - Download functionality for each image
  - Image creation timestamps
  - Responsive design
- **Access**: Protected route (authentication required)

### Core Configuration Files

#### Database Schema (`supabase-setup.sql`)
```sql
-- Users profile table
CREATE TABLE users_profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR,
  avatar VARCHAR,
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users_profile(id),
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  plan_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  credits_per_month INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generation history table
CREATE TABLE generation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users_profile(id) ON DELETE CASCADE,
  url VARCHAR NOT NULL, -- R2 storage URL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_profile_email ON users_profile(email);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_generation_history_user_id ON generation_history(user_id);
CREATE INDEX idx_generation_history_created_at ON generation_history(created_at DESC);
```

#### Internationalization (`messages/en.json`, `messages/zh.json`)
- Supports English (default) and Chinese
- Route structure: `/` (English), `/zh` (Chinese)
- Key sections: header, hero, toolSection, features, pricing, faq, dashboard, history
- Translation keys for user interface elements, error messages, and notifications

### Development Rules

#### Code Quality
- Use TypeScript for all files
- Follow Next.js App Router conventions
- Use Tailwind CSS classes, avoid inline styles
- Implement proper error handling
- Use React Server Components where possible

#### UI Components
- Use shadcn/ui components from `components/ui/`
- Follow consistent styling patterns
- Implement responsive design
- Use proper loading states and error boundaries

#### API Development
- All API routes in `src/app/[locale]/api/`
- Implement proper authentication checks
- Use environment variables for sensitive data
- Return consistent JSON responses
- Handle errors gracefully

### Common Issues & Solutions

#### Authentication Issues
- Verify Google OAuth settings in Google Cloud Console
- Check NEXTAUTH_URL matches your domain
- Ensure NEXTAUTH_SECRET is properly set

#### Database Connection
- Confirm Supabase URL and keys are correct
- Check RLS policies are properly configured
- Verify table schemas match expected structure

#### Image Generation
- Ensure Replicate API token has sufficient credits
- Check model availability and parameters
- Implement proper error handling for API failures

### Testing Guidelines
- Test all authentication flows (Google OAuth)
- Verify credit deduction system works correctly
- Test image generation with various prompts and aspect ratios
- Ensure proper error handling for API failures
- Test internationalization features (English/Chinese)
- Verify dashboard displays correct user data
- Test history page pagination and image downloads
- Validate subscription management flows
- Test responsive design on mobile devices

### Deployment Checklist
1. Set all environment variables in production
2. Update Google OAuth redirect URIs for production domain
3. Configure Stripe webhook endpoints for production
4. Set up Supabase RLS policies for data security
5. Test payment flows end-to-end (all subscription plans)
6. Verify image generation functionality with Replicate API
7. Test dashboard and history pages with real user data
8. Configure proper CORS settings for image downloads
9. Set up monitoring for API endpoints
10. Test internationalization on production domain

## Key Integrations

### Replicate AI
- **Model**: `black-forest-labs/flux-schnell`
- **Input**: Text prompt, aspect ratio selection
- **Output**: High-quality generated images
- **Pricing**: Pay-per-use (3 credits per generation)

### Stripe Payments
- **Plans**: Free (0 credits), Pro ($9.99/200 credits), Premium ($19.99/500 credits)
- **Webhooks**: Handle subscription events
- **Features**: Recurring billing, plan upgrades/downgrades

### Supabase Backend
- **Authentication**: JWT-based user management
- **Database**: PostgreSQL with RLS
- **Storage**: Optional for user uploads
- **Real-time**: Credit updates and notifications