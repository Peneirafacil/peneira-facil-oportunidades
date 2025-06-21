# Peneira Fácil - Football Tryout Platform

## Overview

Peneira Fácil is a full-stack web application designed to connect football players with tryout opportunities across Brazil. The platform allows players to create profiles, search for tryouts, and clubs to post tryout opportunities. The application features a modern React frontend with a Node.js/Express backend, PostgreSQL database, and Replit authentication.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom football-themed color palette
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API architecture
- **Session Management**: Express sessions with PostgreSQL storage
- **Authentication**: Replit Auth with OpenID Connect

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Migrations**: Drizzle Kit for schema migrations
- **Connection**: Neon serverless with WebSocket support

## Key Components

### Authentication System
- Replit Auth integration with OpenID Connect
- Session-based authentication using PostgreSQL session storage
- Automatic user profile creation and management
- Protected routes with authentication middleware

### Player Profile Management
- Comprehensive player profiles with personal information
- Club history tracking with start/end years and levels
- Video portfolio integration (YouTube/Vimeo support)
- Position and modality (Campo/Futsal) specifications
- Location-based filtering (Brazilian states and cities)

### Tryout Management
- Tryout creation and management system
- Location-based search and filtering
- Age-based filtering and requirements
- Real-time tryout status tracking
- Comment system for tryouts

### Subscription System
- Payment integration for premium features
- Subscription status tracking
- Payment history management
- Different access levels for users

## Data Flow

### User Registration/Authentication
1. User initiates login through Replit Auth
2. OpenID Connect flow validates user identity
3. User profile is created/updated in PostgreSQL
4. Session is established and stored in database
5. Frontend receives authenticated user state

### Profile Management
1. User creates/updates profile through React forms
2. Form validation using Zod schemas
3. API requests sent to Express backend
4. Drizzle ORM handles database operations
5. Updated data reflected in UI via React Query

### Tryout Discovery
1. Users apply search filters (location, age, modality)
2. Backend queries database with filtering parameters
3. Results paginated and returned to frontend
4. TanStack Query caches results for performance
5. Real-time updates for tryout status changes

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **express-session**: Session management
- **openid-client**: Authentication flow
- **connect-pg-simple**: PostgreSQL session store

### UI Dependencies
- **@radix-ui/react-***: Headless UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon system

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type safety
- **tsx**: TypeScript execution
- **esbuild**: Production bundling

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module
- **Development Server**: Vite dev server with HMR
- **Process**: `npm run dev` starts both frontend and backend

### Production Deployment
- **Build Process**: Vite builds client, esbuild bundles server
- **Deployment Target**: Replit Autoscale
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPL_ID
- **Static Assets**: Served through Express with Vite middleware

### Database Management
- **Schema Management**: Drizzle Kit for migrations
- **Connection Pooling**: Neon serverless connection pooling
- **Session Storage**: PostgreSQL-based session persistence

## Changelog

Changelog:
- June 21, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.