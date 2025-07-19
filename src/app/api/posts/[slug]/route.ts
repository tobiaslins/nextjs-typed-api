import { createApiHandler } from "../../../../../lib/api-builder";

export const { GET, PUT } = createApiHandler({
  GET: async (input: { slug: string }) => {
    return {
      id: input.slug,
      title: "Sample Post",
      content: "This is sample content...",
      author: { id: "1", name: "John Doe" },
      publishedAt: new Date().toISOString(),
      tags: ["typescript", "nextjs", "react"],
    };
  },

  PUT: async (input: { slug: string; title?: string; content?: string }) => {
    return {
      id: input.slug,
      title: input.title || "Updated Post",
      content: input.content || "Updated content...",
      updatedAt: new Date().toISOString(),
    };
  },
});
