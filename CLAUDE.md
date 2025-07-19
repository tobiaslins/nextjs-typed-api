# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production version (includes type checking)
- `pnpm start` - Start production server
- `pnpm lint` - Run Next.js linting

**Package Manager:**
- Uses pnpm (v10.2.1+) for dependency management
- `pnpm install` - Install dependencies

## Architecture

This is a Next.js application demonstrating a **zero-codegen typed API client** system. The core innovation is achieving full type safety between API routes and client code without build-time code generation.

### Core Components

**1. API Builder (`lib/api-builder.ts`)**
- `createApiHandler()` - Wraps API route handlers with automatic request/response processing
- `withSchema()` - Adds Zod schema validation to handlers
- Type extraction utilities (`ExtractHandlers`, `InferInput`, `InferOutput`)
- Handles both regular functions and schema-validated handlers
- Automatic parsing of query params (GET/DELETE) and JSON body (POST/PUT)

**2. Typed Client (`lib/typed-client.ts`)**
- `createClient()` - Generates SWR-based hooks with full type safety
- `useQuery()` - Type-safe data fetching with SWR
- `useMutation()` - Type-safe mutations with optimistic updates
- Dynamic route parameter substitution (e.g., `/api/users/[id]` → `/api/users/123`)
- Automatic cache invalidation after mutations

**3. API Client Configuration (`src/api-client.ts`)**
- Central registry mapping route paths to their handler types
- Type-only imports of route modules for type extraction
- Exports the configured `api` client for use in components

### Type Flow

1. API routes define handlers with TypeScript input/output types
2. `ExtractHandlers` utility extracts these types from route modules  
3. Route registry (`ApiRoutes`) maps paths to extracted handler types
4. Client hooks automatically infer correct input/output types from the registry
5. Components get full autocomplete and type checking

### File Structure

- `src/app/api/` - Next.js App Router API routes
- `lib/` - Core library files (reusable across projects)
- `src/components/` - React components using the typed API client
- `src/api-client.ts` - API client configuration

### Key Dependencies

- **Next.js 15.4.2** - App Router for API routes
- **Zod 4.0.5** - Runtime schema validation
- **SWR 2.3.4** - Data fetching and caching
- **TypeScript 5** - Type system foundation

### Development Notes

- The system relies entirely on TypeScript's type inference - no runtime codegen
- Route handlers can be plain functions or schema-validated with Zod
- Dynamic routes use bracket notation (`[id]`, `[slug]`) and are handled automatically
- SWR provides caching, revalidation, and optimistic updates out of the box