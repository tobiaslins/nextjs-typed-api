import { NextRequest } from "next/server";

type RouteHandlerWithMetadata<T> = T & {
  __handler: T;
};

type RoutesWithHandlers<THandlers extends Record<string, any>> = {
  [K in keyof THandlers]: RouteHandlerWithMetadata<THandlers[K]>;
} & {
  __handlers: THandlers;
};

export function createApiHandler<
  THandlers extends Record<string, (input: any, context: any) => any>
>(
  handlers: THandlers
): RoutesWithHandlers<THandlers> {
  const createMethod = (method: keyof THandlers) => {
    return async (req: NextRequest, context?: { params: any }) => {
      const handler = handlers[method];

      if (!handler) {
        return Response.json(
          { error: `Method ${String(method)} not allowed` },
          { status: 405 }
        );
      }

      try {
        let input: any;
        if (method === "GET" || method === "DELETE") {
          const url = new URL(req.url);
          const queryParams = Object.fromEntries(url.searchParams.entries());
          input = { ...queryParams, ...context?.params };
        } else {
          const body = await req.json().catch(() => ({}));
          input = { ...body, ...context?.params };
        }

        const result = await handler(input, { req, params: context?.params });

        return Response.json(result, { status: 200 });
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
  ? Handler extends (input: infer I, context: any) => any
    ? I
    : never
  : T extends (input: infer I, context: any) => any
  ? I
  : never;

export type InferOutput<T> = T extends { __handler: infer Handler }
  ? Handler extends (input: any, context: any) => Promise<infer O>
    ? O
    : Handler extends (input: any, context: any) => infer O
    ? O
    : never
  : T extends (input: any, context: any) => Promise<infer O>
  ? O
  : T extends (input: any, context: any) => infer O
  ? O
  : never;
