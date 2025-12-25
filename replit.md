# Calorie & Weight Tracking App

## Overview

A mobile-first calorie and weight tracking application built for daily diet and fitness monitoring. Users can log meals, track weight, record physical activity, and view trends over time. Each day is treated as a separate record to prevent data mixing between dates. The app uses AI-powered nutrition lookup via OpenAI to automatically calculate nutritional information for meals.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: shadcn/ui component library (New York style) with Radix UI primitives
- **Charts**: Recharts for visualizing weight and calorie trends
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful endpoints defined in `shared/routes.ts`
- **Build**: Custom esbuild script bundling server dependencies for production

### Data Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-kit for migrations
- **Schema Validation**: Zod with drizzle-zod integration
- **Schema Location**: `shared/schema.ts` contains all table definitions

### Key Data Models
1. **Daily Entries** (`daily_entries` table): Stores per-day records including weight, height, steps, walking minutes, and strength training data
2. **Meals** (`meals` table): Linked to daily entries via `dailyEntryId`, stores meal type, description, quantity, and nutritional values (calories, protein, carbs, fat, fiber)

### Date Handling
- Uses `YYYY-MM-DD` string format for date identification to avoid timezone issues
- Each day functions as a unique record with strict date separation
- Frontend defaults to navigating to current day on root path

### AI Integration
- OpenAI integration for automatic nutrition calculation from meal descriptions
- Configured via `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` environment variables
- Returns structured JSON with calories, protein, carbs, fat, and fiber values

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage for Express (available but may not be actively used)

### AI Services
- **OpenAI API**: Used for nutrition lookup via the `/api/meals/nutrition` endpoint
- Model: gpt-5.1 with JSON response format
- Requires `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` environment variables

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migration tooling
- `@tanstack/react-query`: Server state management
- `recharts`: Data visualization for trends
- `framer-motion`: Animation library
- `date-fns`: Date manipulation and formatting
- Full shadcn/ui component set via Radix UI primitives

### Development Tools
- Replit-specific Vite plugins for development banner and cartographer
- Runtime error overlay plugin for debugging