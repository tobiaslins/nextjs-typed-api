# Next.js Typed API

A fully type-safe API client for Next.js applications that eliminates the need for code generation while providing complete TypeScript support for your API routes.

## Features

- ✨ **Zero Codegen**: No build step or code generation required
- 🔒 **Full Type Safety**: Input validation and output types automatically inferred
- 🚀 **Dynamic Routes**: Support for parameterized routes like `/api/users/[id]`
- 🎯 **SWR Integration**: Built-in caching and data fetching with SWR
- 📝 **Autocomplete**: Rich IDE support with IntelliSense
- 🛠 **Simple Setup**: Minimal configuration required

## Quick Start

### 1. Create API Routes

Define your API handlers using the `createApiHandler` helper:

```typescript
// src/app/api/users/route.ts
import { createApiHandler } from '../../../../lib/api-builder';

export const { GET, POST } = createApiHandler({
  GET: async (input: { limit?: string; offset?: string }) => {
    return {
      users: [
        { id: '1', name: 'John', email: 'john@example.com' },
        { id: '2', name: 'Jane', email: 'jane@example.com' }
      ],
      total: 2
    };
  },

  POST: async (input: { name: string; email: string }) => {
    return {
      id: Math.random().toString(),
      name: input.name,
      email: input.email,
      createdAt: new Date().toISOString()
    };
  }
});
```

### 2. Set Up the Typed Client

Create your API client configuration:

```typescript
// src/api-client.ts
import { createClient } from '../lib/typed-client';
import type { ExtractHandlers } from '../lib/api-builder';

// Import your API routes
import type * as apiUsers from './app/api/users/route';
import type * as apiUsersId from './app/api/users/[id]/route';

// Define your routes
export type ApiRoutes = {
  '/api/users': ExtractHandlers<typeof apiUsers>;
  '/api/users/[id]': ExtractHandlers<typeof apiUsersId>;
};

// Create and export your typed API client
export const api = createClient<ApiRoutes>();
```

### 3. Use in Components

Now use your fully typed API client in React components:

```typescript
// src/components/UserList.tsx
"use client";

import { api } from "../api-client";

export function UserList() {
  // ✨ Fully typed - TypeScript knows the exact shape!
  const { data, isLoading } = api.useQuery("/api/users", {
    limit: "10",  // TypeScript validates this input
    offset: "0"
  });

  // ✨ Typed mutations
  const { trigger: createUser } = api.useMutation("/api/users", "POST");

  const handleCreate = async () => {
    // TypeScript validates this input matches the POST handler!
    await createUser({
      name: "New User",
      email: "user@example.com"
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={handleCreate}>Create User</button>
      {data?.users.map(user => (  // TypeScript knows data structure
        <div key={user.id}>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
}
```

## Dynamic Routes

The library automatically handles dynamic route parameters:

```typescript
// src/app/api/users/[id]/route.ts
export const { GET, PUT, DELETE } = createApiHandler({
  GET: async (input: { id: string }) => {
    return {
      id: input.id,
      name: 'John Doe',
      email: 'john@example.com'
    };
  },

  PUT: async (input: { id: string; name?: string; email?: string }) => {
    return {
      id: input.id,
      name: input.name || 'John Doe',
      email: input.email || 'john@example.com'
    };
  }
});
```

```typescript
// In your component
const { data: user } = api.useQuery("/api/users/[id]", {
  id: userId  // TypeScript knows this is required
});

const { trigger: updateUser } = api.useMutation("/api/users/[id]", "PUT");

await updateUser({
  id: userId,       // Used for URL parameter
  name: "New Name", // Sent in request body
  email: "new@example.com"
});
```

## API Reference

### `useQuery`

Fetch data from your API endpoints:

```typescript
const { data, error, isLoading, refetch } = api.useQuery(
  "/api/endpoint",
  input?,           // Optional input parameters
  options?          // SWR options
);
```

**Options:**
- `enabled?: boolean` - Enable/disable the query
- `refreshInterval?: number` - Auto-refresh interval
- `revalidateOnFocus?: boolean` - Revalidate when window refocuses
- `fallbackData?: T` - Fallback data while loading

### `useMutation`

Perform mutations (POST, PUT, DELETE):

```typescript
const { trigger, mutate } = api.useMutation("/api/endpoint", "POST");

// With automatic cache revalidation
await trigger(input, {
  optimisticData?: T,        // Optimistic update data
  rollbackOnError?: boolean, // Rollback on error (default: true)
  revalidate?: boolean       // Revalidate cache (default: true)
});
```

## How It Works

This library leverages TypeScript's powerful type system to extract types directly from your API route handlers:

1. **Handler Definition**: You define your API handlers with proper TypeScript types
2. **Type Extraction**: The `ExtractHandlers` utility extracts input/output types from your handlers
3. **Route Registration**: You map route paths to their corresponding handler types
4. **Client Generation**: The typed client provides autocomplete and validation based on your actual API

No code generation, no build steps, no external dependencies - just pure TypeScript magic!

## Benefits

- **DX**: Instant feedback and autocomplete in your IDE
- **Safety**: Catch API contract violations at compile time
- **Maintainability**: Types automatically stay in sync with your API
- **Performance**: Built on SWR for optimal caching and data fetching
- **Simplicity**: No complex setup or configuration required

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Type check
pnpm build
```

## License

MIT

---

*Built with ❤️ for the Next.js community*