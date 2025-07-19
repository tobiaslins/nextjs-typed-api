// Comprehensive test to validate that our type system is working
import { api } from './src/api-client';

function TypeValidationComponent() {
  // Valid usage - these should all work without TypeScript errors
  const postsQuery = api.useQuery("/api/posts", { category: "tech", limit: "10" });
  const allPostsQuery = api.useQuery("/api/posts", {}); // Empty params should work
  const categoryOnlyQuery = api.useQuery("/api/posts", { category: "life" });
  const limitOnlyQuery = api.useQuery("/api/posts", { limit: "5" });
  
  // User queries with dynamic routes
  const userQuery = api.useQuery("/api/users/[id]", { id: "123" });
  const usersListQuery = api.useQuery("/api/users", {});
  
  // Post by slug
  const postBySlugQuery = api.useQuery("/api/posts/[slug]", { slug: "my-post" });
  
  // Mutations
  const { trigger: createPost } = api.useMutation("/api/posts", "POST");
  const { trigger: updateUser } = api.useMutation("/api/users/[id]", "PUT");
  const { trigger: deleteUser } = api.useMutation("/api/users/[id]", "DELETE");
  
  const handleCreatePost = async () => {
    // This should work - all required fields provided
    await createPost({
      title: "New Post",
      content: "Post content here",
      category: "tech"
    });
  };
  
  const handleUpdateUser = async () => {
    // This should work - id is a dynamic route param
    await updateUser({
      id: "123",
      name: "Updated Name",
      email: "updated@example.com"
    });
  };
  
  const handleDeleteUser = async () => {
    // This should work - only id needed for DELETE
    await deleteUser({ id: "123" });
  };

  return (
    <div>
      <h1>Type Validation Test</h1>
      
      <section>
        <h2>Posts</h2>
        {postsQuery.isLoading && <p>Loading posts...</p>}
        {postsQuery.error && <p>Error: {postsQuery.error.message}</p>}
        {postsQuery.data && (
          <div>
            <p>Found {postsQuery.data.posts.length} posts</p>
            <p>Page {postsQuery.data.pagination.page} of {postsQuery.data.pagination.totalPages}</p>
          </div>
        )}
      </section>
      
      <section>
        <h2>User</h2>
        {userQuery.isLoading && <p>Loading user...</p>}
        {userQuery.data && (
          <div>
            <h3>{userQuery.data.name}</h3>
            <p>{userQuery.data.email}</p>
          </div>
        )}
      </section>
      
      <section>
        <h2>Actions</h2>
        <button onClick={handleCreatePost}>Create Post</button>
        <button onClick={handleUpdateUser}>Update User</button>
        <button onClick={handleDeleteUser}>Delete User</button>
      </section>
    </div>
  );
}

export default TypeValidationComponent;