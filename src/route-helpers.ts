import type { ApiRoutes } from "./api-client";

// Get autocomplete for all your route paths
export type RoutePath = keyof ApiRoutes;

// Helper to ensure route exists at compile time
export function route<T extends RoutePath>(path: T): T {
  return path;
}

// Route builder with parameter substitution
export function buildRoute<T extends RoutePath>(
  path: T,
  params: Record<string, string>
): string {
  return Object.entries(params).reduce(
    (route, [key, value]) => route.replace(`[${key}]`, value),
    path as string
  );
}

// Usage examples:
// const userRoute = route('/api/users/[id]'); // ✨ Autocompleted!
// const dynamicRoute = buildRoute('/api/users/[id]', { id: userId });
