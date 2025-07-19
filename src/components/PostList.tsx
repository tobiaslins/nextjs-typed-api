"use client";

import { api } from "../api-client";

export function PostList() {
  // TypeScript knows the exact shape of the response
  const { data, isLoading } = api.useQuery("/api/posts", {
    category: "tech",
    limit: "10",
  });

  const { trigger: createPost } = api.useMutation("/api/posts", "POST");

  const handleCreate = async () => {
    // TypeScript validates this matches the POST input type
    await createPost({
      title: "New Post",
      content: "Content here...",
      category: "tech",
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={handleCreate}>Create Post</button>
      {data?.posts.map((post) => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>Category: {post.category}</p>
        </div>
      ))}
      <p>
        Page {data?.pagination.page} of {data?.pagination.totalPages}
      </p>
    </div>
  );
}
