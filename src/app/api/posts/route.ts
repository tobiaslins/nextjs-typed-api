import { createApiHandler } from '../../../../lib/api-builder';

export const { GET, POST } = createApiHandler({
  GET: async (input: { category?: string; limit?: string }) => {
    return {
      posts: [
        { id: '1', title: 'First Post', slug: 'first-post', category: 'tech' },
        { id: '2', title: 'Second Post', slug: 'second-post', category: 'life' }
      ],
      pagination: { page: 1, totalPages: 5 }
    };
  },

  POST: async (input: { title: string; content: string; category: string }) => {
    return {
      id: Math.random().toString(),
      title: input.title,
      slug: input.title.toLowerCase().replace(/\s+/g, '-'),
      content: input.content,
      category: input.category,
      createdAt: new Date().toISOString()
    };
  }
});