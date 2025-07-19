import { NextRequest } from "next/server";
import { z } from "zod";

type RegularHandler = (
  input: any,
  context: { req: NextRequest; params?: any }
) => any;

type SchemaHandler = {
  schema: z.ZodSchema;
  handler: (input: any, context: { req: NextRequest; params?: any }) => any;
  __isSchemaHandler: true;
};

type Handler = RegularHandler | SchemaHandler;

type RouteHandlerWithMetadata<T> = T & {
  __handler: T;
};

type RoutesWithHandlers<THandlers extends Record<string, Handler>> = {
  [K in keyof THandlers]: RouteHandlerWithMetadata<THandlers[K]>;
} & {
  __handlers: THandlers;
};

// Helper function to create a handler with schema validation
export function withSchema<TSchema extends z.ZodSchema, TOutput>(
  schema: TSchema,
  handler: (
    input: z.infer<TSchema>,
    context: { req: NextRequest; params?: any }
  ) => TOutput
): {
  schema: TSchema;
  handler: typeof handler;
  __isSchemaHandler: true;
  __inferredOutput: TOutput;
} {
  return {
    schema,
    handler,
    __isSchemaHandler: true as const,
    __inferredOutput: undefined as any as TOutput,
  };
}

export function createApiHandler<THandlers extends Record<string, Handler>>(
  handlers: THandlers
): RoutesWithHandlers<THandlers> {
  const createMethod = (method: keyof THandlers) => {
    return async (req: NextRequest, context?: { params: any }) => {
      const handlerDef = handlers[method];

      if (!handlerDef) {
        return Response.json(
          { error: `Method ${String(method)} not allowed` },
          { status: 405 }
        );
      }

      try {
        let rawInput: any;
        if (method === "GET" || method === "DELETE") {
          const url = new URL(req.url);
          const queryParams = Object.fromEntries(url.searchParams.entries());
          rawInput = { ...queryParams, ...context?.params };
        } else {
          const body = await req.json().catch(() => ({}));
          rawInput = { ...body, ...context?.params };
        }

        // Check if this is a handler with schema
        if (
          typeof handlerDef === "object" &&
          handlerDef !== null &&
          "__isSchemaHandler" in handlerDef
        ) {
          // Validate input with Zod schema
          const schemaHandler = handlerDef as SchemaHandler;
          const validationResult = schemaHandler.schema.safeParse(rawInput);

          if (!validationResult.success) {
            return Response.json(
              {
                error: "Validation failed",
                details: validationResult.error.issues,
              },
              { status: 400 }
            );
          }

          const result = await schemaHandler.handler(validationResult.data, {
            req,
            params: context?.params,
          });
          return Response.json(result, { status: 200 });
        } else {
          // Regular handler function
          const result = await (handlerDef as RegularHandler)(rawInput, {
            req,
            params: context?.params,
          });
          return Response.json(result, { status: 200 });
        }
      } catch (error) {
        console.error("API Error:", error);
        return Response.json(
          {
            error:
              error instanceof Error ? error.message : "Internal server error",
          },
          { status: 500 }
        );
      }
    };
  };

  const routes = {} as RoutesWithHandlers<THandlers>;

  // Create route handlers for each HTTP method
  Object.keys(handlers).forEach((method) => {
    const routeHandler = createMethod(method);
    // Attach original handler for type inference
    (routeHandler as any).__handler = handlers[method];
    (routes as any)[method] = routeHandler;
  });

  // Attach handlers for type inference
  (routes as any).__handlers = handlers;
  return routes;
}

// Type utilities for extracting handler types from route modules
export type ExtractHandlers<T> = {
  [K in keyof T]: T[K] extends { __handler: infer H } ? H : never;
};

export type InferInput<T> = T extends { __handler: infer Handler }
  ? InferHandlerInput<Handler>
  : InferHandlerInput<T>;

type InferHandlerInput<Handler> = Handler extends { schema: infer Schema }
  ? Schema extends z.ZodSchema
    ? z.infer<Schema>
    : never
  : Handler extends (input: infer I, context: any) => any
  ? I
  : never;

export type InferOutput<T> = T extends { __handler: infer Handler }
  ? InferHandlerOutput<Handler>
  : InferHandlerOutput<T>;

type InferHandlerOutput<Handler> = Handler extends { handler: infer HandlerFn }
  ? HandlerFn extends (...args: any[]) => Promise<infer O>
    ? O
    : HandlerFn extends (...args: any[]) => infer O
    ? O
    : never
  : Handler extends (...args: any[]) => Promise<infer O>
  ? O
  : Handler extends (...args: any[]) => infer O
  ? O
  : never;
