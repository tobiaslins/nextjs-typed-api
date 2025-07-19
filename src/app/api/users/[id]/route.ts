import { createApiHandler, withSchema } from "../../../../../lib/api-builder";
import { z } from "zod";

const UserIdSchema = z.object({
  id: z.string().min(1, "User ID is required"),
});

const UpdateUserSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Name cannot be empty").optional(),
  email: z.string().email({ message: "Invalid email format" }).optional(),
});

export const { GET, PUT, DELETE } = createApiHandler({
  GET: withSchema(UserIdSchema, async (input) => {
    // input is automatically validated and typed!
    return {
      id: input.id,
      name: "John Doe",
      email: "john@example.com",
      createdAt: new Date().toISOString(),
    };
  }),

  PUT: withSchema(UpdateUserSchema, async (input) => {
    // input is automatically validated and typed!
    return {
      id: input.id,
      name: input.name || "John Doe",
      email: input.email || "john@example.com",
      updatedAt: new Date().toISOString(),
    };
  }),

  DELETE: withSchema(UserIdSchema, async (input) => {
    // input is automatically validated and typed!
    return { success: true, deletedId: input.id };
  }),
});
