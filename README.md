# Next.js Typed API

A fully type-safe API client for Next.js applications that eliminates the need for code generation while providing complete TypeScript support for your API routes.

## Features

- ✨ **Zero Codegen**: No build step or code generation required
- 🔒 **Full Type Safety**: Input validation and output types automatically inferred
- 🛡️ **Runtime Validation**: Optional Zod schema validation for robust input checking
- 🚀 **Dynamic Routes**: Support for parameterized routes like `/api/users/[id]`
- 🎯 **SWR Integration**: Built-in caching and data fetching with SWR
- 📝 **Autocomplete**: Rich IDE support with IntelliSense
- 🛠 **Simple Setup**: Minimal configuration required

## Quick Start

### 1. Create API Routes

Define your API handlers using the `createApiHandler` helper. You can use either simple TypeScript types or Zod schemas for validation:

#### Basic TypeScript Types

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

#### With Zod Schema Validation

For runtime validation and better error handling, use the `withSchema` helper:

```typescript
// src/app/api/users/route.ts
import { createApiHandler, withSchema } from '../../../../lib/api-builder';
import { z } from 'zod';

const getUsersSchema = z.object({
  limit: z.string().optional().default("10"),
  offset: z.string().optional().default("0"),
});

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
});

export const { GET, POST } = createApiHandler({
  GET: withSchema(getUsersSchema, async (input) => {
    const limit = parseInt(input.limit);
    const offset = parseInt(input.offset);
    
    return {
      users: [
        { id: '1', name: 'John', email: 'john@example.com' },
        { id: '2', name: 'Jane', email: 'jane@example.com' }
      ],
      total: 2,
      limit,
      offset
    };
  }),

  POST: withSchema(createUserSchema, async (input) => {
    // Input is automatically validated and typed!
    return {
      id: Math.random().toString(),
      name: input.name,
      email: input.email,
      createdAt: new Date().toISOString()
    };
  })
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

The library automatically handles dynamic route parameters. You can use either basic types or Zod schemas:

#### Basic Dynamic Routes

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

#### Dynamic Routes with Zod Validation

```typescript
// src/app/api/users/[id]/route.ts
import { createApiHandler, withSchema } from '../../../../../lib/api-builder';
import { z } from 'zod';

const getUserSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
});

const updateUserSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

export const { GET, PUT, DELETE } = createApiHandler({
  GET: withSchema(getUserSchema, async (input) => {
    // id is validated as UUID
    return {
      id: input.id,
      name: 'John Doe',
      email: 'john@example.com'
    };
  }),

  PUT: withSchema(updateUserSchema, async (input) => {
    // All fields are validated
    return {
      id: input.id,
      name: input.name || 'John Doe',
      email: input.email || 'john@example.com'
    };
  })
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

## Runtime Validation with Zod

When using `withSchema`, your API routes automatically handle validation and return appropriate error responses:

### Validation Benefits

- **Automatic Error Responses**: Invalid input returns structured 400 errors
- **Type Safety**: Input is automatically typed based on your schema
- **Rich Validation**: Use Zod's full validation features (email, UUID, custom validators, etc.)
- **Error Details**: Detailed validation error information for debugging

### Error Response Format

When validation fails, the API automatically returns:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": ["email"],
      "message": "Invalid email format"
    }
  ]
}
```

### Advanced Zod Usage

```typescript
import { z } from 'zod';

const complexSchema = z.object({
  user: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    age: z.number().int().min(18, "Must be 18 or older"),
    email: z.string().email("Invalid email"),
    role: z.enum(["user", "admin", "moderator"]),
  }),
  preferences: z.object({
    notifications: z.boolean().default(true),
    theme: z.enum(["light", "dark"]).default("light"),
  }).optional(),
  tags: z.array(z.string()).max(5, "Maximum 5 tags allowed"),
});

export const { POST } = createApiHandler({
  POST: withSchema(complexSchema, async (input) => {
    // input is fully typed and validated!
    const { user, preferences, tags } = input;
    return { success: true, userId: "123" };
  })
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

### `withSchema`

Add Zod validation to your API handlers:

```typescript
import { withSchema } from '../lib/api-builder';
import { z } from 'zod';

const mySchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

const handler = withSchema(mySchema, async (input) => {
  // input is validated and typed
  return { success: true };
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