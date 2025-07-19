import { createClient } from '../lib/typed-client';
import type { ExtractHandlers } from '../lib/api-builder';

// Import your API routes - these will be the named exports from route.ts files
import type * as apiUsersId from './app/api/users/[id]/route';
import type * as apiUsers from './app/api/users/route';
import type * as apiPosts from './app/api/posts/route';
import type * as apiPostsSlug from './app/api/posts/[slug]/route';

// Define your routes - just map paths to the route exports
export type ApiRoutes = {
  '/api/users/[id]': ExtractHandlers<typeof apiUsersId>;
  '/api/users': ExtractHandlers<typeof apiUsers>;
  '/api/posts': ExtractHandlers<typeof apiPosts>;
  '/api/posts/[slug]': ExtractHandlers<typeof apiPostsSlug>;
};

// Create and export your typed API client
export const api = createClient<ApiRoutes>();