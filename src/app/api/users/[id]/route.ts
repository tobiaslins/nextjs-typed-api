import { createApiHandler } from '../../../../../lib/api-builder';

export const { GET, PUT, DELETE } = createApiHandler({
  GET: async (input: { id: string }) => {
    return {
      id: input.id,
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date().toISOString()
    };
  },
  
  PUT: async (input: { id: string; name?: string; email?: string }) => {
    return {
      id: input.id,
      name: input.name || 'John Doe',
      email: input.email || 'john@example.com',
      updatedAt: new Date().toISOString()
    };
  },

  DELETE: async (input: { id: string }) => {
    return { success: true, deletedId: input.id };
  }
});