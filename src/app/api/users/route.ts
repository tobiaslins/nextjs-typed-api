import { createApiHandler, withSchema } from '../../../../lib/api-builder';
import { z } from 'zod';

// Define schemas for validation
const GetUsersSchema = z.object({
  limit: z.string().optional().default('10'),
  offset: z.string().optional().default('0')
});

const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email({ message: 'Invalid email format' })
});

export const { GET, POST } = createApiHandler({
  GET: withSchema(GetUsersSchema, async (input) => {
    // input is automatically validated and typed from the schema!
    const limit = parseInt(input.limit);
    const offset = parseInt(input.offset);
    
    return {
      users: [
        { id: '1', name: 'John', email: 'john@example.com' },
        { id: '2', name: 'Jane', email: 'jane@example.com' }
      ].slice(offset, offset + limit),
      total: 50,
      hasMore: offset + limit < 50
    };
  }),

  POST: withSchema(CreateUserSchema, async (input) => {
    // input is automatically validated and typed from the schema!
    return {
      id: Math.random().toString(),
      name: input.name,
      email: input.email,
      createdAt: new Date().toISOString()
    };
  })
});