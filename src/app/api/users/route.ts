import { createApiHandler } from '../../../../lib/api-builder';

export const { GET, POST } = createApiHandler({
  GET: async (input: { limit?: string; offset?: string }) => {
    const limit = parseInt(input.limit || '10');
    const offset = parseInt(input.offset || '0');
    
    return {
      users: [
        { id: '1', name: 'John', email: 'john@example.com' },
        { id: '2', name: 'Jane', email: 'jane@example.com' }
      ].slice(offset, offset + limit),
      total: 50,
      hasMore: offset + limit < 50
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