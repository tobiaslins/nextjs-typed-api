"use client";

import { api } from "../api-client";

export function UserProfile({ userId }: { userId: string }) {
  // ✨ Fully typed - no codegen needed!
  const {
    data: user,
    isLoading,
    error,
  } = api.useQuery("/api/users/[id]", {
    id: userId,
  });

  // ✨ Typed mutations
  const { trigger: updateUser } = api.useMutation("/api/users/[id]", "PUT");
  const { trigger: deleteUser } = api.useMutation("/api/users/[id]", "DELETE");

  const handleUpdate = async () => {
    // TypeScript validates this input matches the PUT handler type!
    const res = await updateUser({
      id: userId,
      name: "New Name",
      email: "new@example.com",
    });
    console.log(res);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <p>Created: {user.createdAt}</p>
      <button onClick={handleUpdate}>Update User</button>
    </div>
  );
}
