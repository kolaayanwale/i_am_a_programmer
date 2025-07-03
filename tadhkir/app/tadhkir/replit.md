# Tadhkir - Memorial Pages Platform

## Overview

Tadhkir is a memorial pages platform that allows users to create and manage digital tributes for their loved ones. The application enables visitors to find memorial pages, subscribe to reminders, and honor the memory of those who have passed away. Built with a modern full-stack architecture using React, Express, and PostgreSQL.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Management**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful endpoints with JSON responses

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Connection pooling via @neondatabase/serverless

## Key Components

### Authentication System
- **Provider**: Replit Auth integration with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Automatic user creation and profile management
- **Security**: HTTP-only cookies with secure flags in production

### Memorial Pages System
- **Subject Management**: Users can create memorial pages for individuals
- **Public Access**: Memorial pages accessible via clean URLs (slug-based routing)
- **Profile Information**: Name, relationship, dates, contact information, photos

### Subscription System
- **Reminder Service**: Users can subscribe to periodic reminders about memorial pages
- **Notification Channels**: Email, SMS, and push notification support
- **Frequency Options**: Daily, weekly, monthly, quarterly, annual, birthday, and death anniversary reminders
- **Granular Timing**: Time-of-day selection (morning, afternoon, evening, or specific time)
- **Specific Times**: Custom time selection in 24-hour format for precise scheduling
- **Date-Based Reminders**: Special reminders on birthdays and death anniversaries
- **Standardized Messages**: Islamic prayer message templates with automatic personalization

### UI Component System
- **Design System**: Shadcn/ui with consistent theming
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: ARIA-compliant components from Radix UI
- **Dark Mode**: CSS variables-based theme switching

## Data Flow

### User Registration/Authentication
1. User initiates login via Replit Auth
2. OpenID Connect flow validates user identity
3. User profile created/updated in PostgreSQL
4. Session established with PostgreSQL session store

### Memorial Page Creation
1. Authenticated user submits memorial page form
2. Form validation using Zod schemas
3. Subject record created in database via Drizzle ORM
4. Page accessible via generated slug URL

### Subscription Management
1. Visitor finds memorial page via search or direct URL
2. Subscription form captures contact information and preferences
3. Subscription record created with notification settings
4. Background services handle reminder delivery (future implementation)

### Public Memorial Access
1. Visitor navigates to memorial page URL
2. Server renders page with subject information
3. Subscription options presented to visitors
4. No authentication required for viewing

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query
- **Build Tools**: Vite, TypeScript, ESBuild
- **UI/Styling**: Tailwind CSS, Radix UI primitives, Lucide icons

### Backend Dependencies
- **Database**: Drizzle ORM, @neondatabase/serverless, pg
- **Authentication**: Passport.js, OpenID Client
- **Session Management**: Express-session, connect-pg-simple
- **Email Service**: SendGrid integration with prayer reminder templates

### Development Tools
- **Code Quality**: TypeScript strict mode, ESLint configuration
- **Database Tools**: Drizzle Kit for schema management
- **Development Server**: Vite dev server with HMR

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module provisioned automatically
- **Hot Reload**: Vite development server with fast refresh
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPL_ID

### Production Build Process
1. Frontend assets built with Vite (optimized bundles)
2. Backend compiled with ESBuild (ESM format)
3. Static files served from dist/public directory
4. Server bundle executed with Node.js

### Database Migration Strategy
- **Schema Management**: Drizzle migrations in ./migrations directory
- **Deployment**: `npm run db:push` applies schema changes
- **Version Control**: Migration files tracked in repository

### Hosting Configuration
- **Port Configuration**: Server runs on port 5000
- **Static Assets**: Frontend served from Express static middleware
- **Database Connection**: Pooled connections via Neon serverless
- **Session Storage**: PostgreSQL table for session persistence

## Changelog

```
Changelog:
- June 16, 2025. Initial setup
- June 22, 2025. Enhanced reminder frequency system with granular timing options:
  * Added daily reminder frequency
  * Implemented time-of-day blocks (morning, afternoon, evening)
  * Added specific time selection in 24-hour format
  * Created birthday and death anniversary reminder frequencies
  * Maintained standardized Islamic prayer message system
- June 24, 2025. Implemented email delivery system:
  * Added SendGrid integration for prayer reminder emails
  * Created HTML and text email templates
  * Built email testing endpoints for verification
  * Added day selection for weekly/monthly/quarterly/annual reminders
  * Configured for reminder@tadhkir.org (verified and working)
  * Email templates include HTML and text formats with Islamic prayer formatting
- June 25, 2025. Added live search functionality:
  * Implemented search bar in navigation with real-time results
  * Created API endpoint for searching memorial pages by name
  * Added dropdown with clickable results and profile pictures
  * Included "create new page" option when no matches found
  * Search works across all existing memorial pages with ILIKE matching
  * Fixed case sensitivity issues - removed duplicate entries and implemented automatic name capitalization
  * All names now properly capitalized (Title Case) for consistency
- June 25, 2025. Redesigned subscription flow:
  * Changed "Create memorial page" to "Set up reminders" in search results
  * Created new subscription-first flow with SetupRemindersModal
  * Added gender toggle buttons (male/female) with male pre-selected
  * Added optional Date of Birth and Date of Death fields
  * Birthday/Death Anniversary frequencies only available when respective dates provided
  * Subscription creates standalone reminders without requiring memorial page
  * Added CreateMemorialModal for optional memorial page creation after subscription
  * Memorial page creation currently disabled for development
  * Updated database schema to support standalone subscriptions
- June 25, 2025. Updated landing page for subscription-first flow:
  * Changed "Create Memorial Page" to "Set Up Reminders" on landing page
  * Updated heading from "Create a Memorial Page" to "Set Up Prayer Reminders"
  * Changed description to focus on prayer reminders instead of memorial pages
  * Landing page first/last name inputs now trigger SetupRemindersModal
  * Made subscription creation endpoint public (removed authentication requirement)
  * Fixed subscription creation flow to work without authentication
  * Updated database schema to allow nullable subject_id for standalone subscriptions
  * Modified person page to use same SetupRemindersModal as search and landing page
  * All three subscription entry points now use consistent flow and modal
  * Fixed database schema constraint - changed subjectId from serial to nullable integer reference
  * Person page now properly uses SetupRemindersModal instead of old subscription dialog
  * Removed duplicate subscription modal code from person page
  * Updated SetupRemindersModal to use separate "First Name" and "Last Name" fields
  * Fixed database constraint by making subject_id nullable via SQL command
  * Fixed email delivery system - test emails working successfully with SendGrid
  * Updated subscription email delivery with proper error handling and personalized prayer messages
  * Confirmed SendGrid API key configured correctly and verified sender domain working
  * Email delivery confirmed working - user received test emails in inbox successfully
  * Added automatic welcome email with personalized prayer message upon subscription creation
  * Fixed welcome email delivery in subscription creation flow with proper import statement
  * Manual test reminders working perfectly - users receive emails immediately when triggered
  * Subscription creation now includes automatic welcome email with personalized Islamic prayer messages
  * Enhanced email deliverability with proper sender formatting, reply-to headers, and improved HTML templates
  * Added branded email design with Tadhkir logo and better mobile responsiveness
  * Emails sending successfully from server but may need spam folder checking or email provider whitelist
  * Yahoo email delivery confirmed working - user received test emails successfully
  * Testing Gmail delivery to ensure cross-platform email compatibility
  * Gmail delivery blocked by aggressive filtering - optimized email format and content
  * Implemented improved email templates with better deliverability formatting
  * Added email categories and custom headers for better provider recognition
- June 25, 2025. Implemented comprehensive unsubscribe management system:
  * Created unsubscribe page with subscription management interface
  * Added toggle switches for individual subscription activation/deactivation
  * Implemented delete functionality for individual subscriptions
  * Added "unsubscribe all" button for bulk deactivation
  * Updated email templates with proper unsubscribe links
  * Added API endpoints for email-based subscription management
  * Created subscription lookup by email for unsubscribe flow
  * Enhanced storage layer with email-based subscription queries
  * Tested unsubscribe flow end-to-end - working perfectly
  * Users can toggle individual subscriptions, delete subscriptions, or unsubscribe from all
  * Email links direct to unsubscribe page with proper subscription management interface
  * All CRUD operations for subscription management functional
  * Fixed unsubscribe URL routing issues by implementing path-based email parameter
  * Updated email templates to use /unsubscribe/email format for better client-side routing compatibility
  * Added fallback support for both query parameter and path parameter approaches
- June 25, 2025. Fixed daily subscription scheduling bug:
  * Corrected calculateNextNotification function to properly handle daily frequency
  * Daily subscriptions now schedule for next day instead of weekly intervals
  * Added proper time setting based on timeOfDay and specificTime preferences
  * Enhanced unsubscribe page to display both date and time for next reminders
  * All subscription frequencies now calculate correct next notification dates
- June 25, 2025. Improved timezone handling for better user experience:
  * Fixed API request format issues in unsubscribe page (delete/toggle operations now working)
  * Updated time calculations to use local timezone instead of UTC
  * Next reminder times now display in user's local timezone (e.g., 9:00 AM shows as 9:00 AM, not 3:00 AM)
  * Enhanced datetime handling for better UX with client-side timezone display
  * All existing subscriptions updated with correct local timezone scheduling
- June 25, 2025. Fixed critical database connection stability issues:
  * Enhanced database connection pool configuration with proper timeouts and limits
  * Added graceful shutdown handlers for database connections
  * Improved error handling in subscription CRUD operations with detailed logging
  * Fixed server crashes during subscription deletion with better exception management
  * Added input validation for subscription IDs to prevent invalid operations
  * Enhanced client-side error handling with better user feedback and logging
  * Database operations now more resilient to connection interruptions
- June 25, 2025. Enhanced prayer message system with dynamic formatting:
  * Implemented gender-aware prayer message formatting using {first-name} and {pronoun} placeholders
  * Added formatPrayerMessage helper function to DatabaseStorage class
  * Updated prayer messages to use first name initially and gender-appropriate pronouns (him/her) subsequently
  * Modified email scheduler and subscription creation to use new formatting system
  * Added navigation bar to unsubscribe page for better user experience
  * Updated all "Tadhkira" references to "Tadhkir" across the entire codebase
  * Created additional prayer message templates demonstrating the new placeholder system
  * Prayer messages now properly personalized based on subject's gender and name
- June 25, 2025. Final UI updates for deployment:
  * Updated landing page heading from "Remember & Honor" to "Remember"
  * Added sample prayers section with Arabic and English prayers in vertical layout
  * Updated About page to prioritize prayer reminders over memorial pages
  * Memorial pages now positioned as optional feature for sharing with family
  * Enhanced About page with focus on personalized Islamic prayer system
- June 26, 2025. Fixed subscription button and enhanced UX:
  * Resolved unresponsive "Subscribe to Reminders" button by fixing Dialog accessibility issues
  * Added proper DialogDescription components to all modals for ARIA compliance
  * Fixed form validation schema for conditional specificTime field validation
  * Enhanced time-of-day dropdown with specific times: Morning (9:00 AM), Afternoon (2:00 PM), Evening (7:00 PM)
  * Subscription flow now fully functional with email delivery working perfectly
  * Removed debug logging code for production-ready deployment
  * Fixed welcome email issue - subject names now properly constructed from firstName+lastName fields
  * Welcome emails now send with correct personalized subject lines and prayer messages
  * Confirmed email delivery working with SendGrid (response 202 - accepted for delivery)
  * Fixed daily reminder scheduling - no longer skips the subscription creation day
  * Daily reminders now schedule for same day if before reminder time, next day if after
  * Implemented proper local timezone handling instead of UTC-only scheduling
  * System now correctly interprets user's local time for reminder scheduling
- June 26, 2025. Updated email unsubscribe links for production deployment:
  * Changed unsubscribe URLs from development localhost to production domain (tadhkir.replit.app)
  * Fixed email template TypeScript issues with proper parameter handling
  * All prayer reminder emails now include correct production unsubscribe links
  * Users can now properly manage subscriptions from deployed app
  * Fixed unsubscribe link format from path-based to query parameter URLs for better compatibility
  * Corrected email domain to use REPLIT_DOMAINS environment variable for proper URL generation
  * Email links now work correctly in both development and production environments
  * Added production SPA routing support to properly handle React client-side routes in deployment
  * Fixed unsubscribe page routing issues by implementing catch-all route for non-API paths
  * System now properly serves React app for all frontend routes in production builds
- June 26, 2025. Completed production build and routing fix:
  * Successfully built frontend assets with Vite (463KB main bundle, 67KB CSS)
  * Built backend server bundle with ESBuild (58.5KB optimized)
  * Added production SPA routing support in server/index.ts for React client-side routes
  * Created dist/public directory with optimized assets ready for deployment
  * Verified unsubscribe route returns HTTP 200 in development environment
  * Build artifacts ready for Replit deployment to fix production domain routing
- June 26, 2025. Fixed unsubscribe links to always use production domain:
  * Updated emailService.ts to hardcode production domain (tadhkir.replit.app) 
  * Removed dynamic environment variable usage for unsubscribe URLs
  * All prayer reminder emails now contain production domain links
  * Eliminated development URLs from end-user email communications
  * Text and HTML email templates both use consistent production domain
- June 26, 2025. Fixed production deployment issues:
  * Removed conflicting SPA routing code that caused path resolution errors
  * Fixed environment detection to use NODE_ENV instead of app.get("env")
  * Eliminated duplicate route handlers that interfered with static file serving
  * Cleaned up server/index.ts imports and routing logic
  * Production build now correctly serves from dist/public directory
  * Verified unsubscribe routes return HTTP 200 in production environment
  * Server bundle optimized to 57.4KB for faster deployment
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```