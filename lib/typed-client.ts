import useSWR, { mutate } from "swr";
import { useCallback } from "react";
import type { ExtractHandlers, InferInput, InferOutput } from "./api-builder";

async function fetcher(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(error.error || "Request failed");
  }

  return res.json();
}

export function createClient<TRoutes extends Record<string, any>>() {
  return {
    useQuery: <
      TRoute extends keyof TRoutes,
      TMethod extends keyof TRoutes[TRoute] = "GET"
    >(
      route: TRoute,
      input?: InferInput<TRoutes[TRoute][TMethod]>,
      options?: {
        enabled?: boolean;
        refreshInterval?: number;
        revalidateOnFocus?: boolean;
        fallbackData?: InferOutput<TRoutes[TRoute][TMethod]>;
      }
    ) => {
      // Handle dynamic routes by replacing brackets with actual values
      let finalRoute = String(route);
      const params: Record<string, any> = {};
      const queryParams: Record<string, any> = {};

      if (input && typeof input === "object") {
        for (const [key, value] of Object.entries(input)) {
          if (finalRoute.includes(`[${key}]`)) {
            finalRoute = finalRoute.replace(`[${key}]`, String(value));
            params[key] = value;
          } else {
            queryParams[key] = value;
          }
        }
      }

      const queryString =
        Object.keys(queryParams).length > 0
          ? "?" +
            new URLSearchParams(
              queryParams as Record<string, string>
            ).toString()
          : "";

      const key =
        options?.enabled !== false ? `${finalRoute}${queryString}` : null;

      const {
        data,
        error,
        isLoading,
        mutate: mutateFn,
      } = useSWR(key, fetcher, {
        refreshInterval: options?.refreshInterval,
        revalidateOnFocus: options?.revalidateOnFocus ?? true,
        fallbackData: options?.fallbackData,
      });

      return {
        data: data as InferOutput<TRoutes[TRoute][TMethod]> | undefined,
        error,
        isLoading,
        refetch: mutateFn,
      };
    },

    useMutation: <
      TRoute extends keyof TRoutes,
      TMethod extends Exclude<keyof TRoutes[TRoute], "GET">
    >(
      route: TRoute,
      method: TMethod
    ) => {
      const mutationFn = useCallback(
        async (input?: InferInput<TRoutes[TRoute][TMethod]>) => {
          // Handle dynamic routes by replacing brackets with actual values
          let finalRoute = String(route);
          const bodyData: Record<string, any> = {};

          if (input && typeof input === "object") {
            for (const [key, value] of Object.entries(input)) {
              if (finalRoute.includes(`[${key}]`)) {
                finalRoute = finalRoute.replace(`[${key}]`, String(value));
              } else {
                bodyData[key] = value;
              }
            }
          }

          const options: RequestInit = {
            method: String(method),
          };

          if (Object.keys(bodyData).length > 0 && method !== "DELETE") {
            options.body = JSON.stringify(bodyData);
          }

          return fetcher(finalRoute, options) as Promise<
            InferOutput<TRoutes[TRoute][TMethod]>
          >;
        },
        [route, method]
      );

      const trigger = useCallback(
        async (
          input?: InferInput<TRoutes[TRoute][TMethod]>,
          options?: {
            optimisticData?: InferOutput<TRoutes[TRoute][TMethod]>;
            rollbackOnError?: boolean;
            revalidate?: boolean;
          }
        ) => {
          try {
            if (options?.optimisticData) {
              await mutate(String(route), options.optimisticData, false);
            }

            const result = await mutationFn(input);

            if (options?.revalidate !== false) {
              // Handle dynamic routes for cache invalidation
              let baseRoute = String(route);
              if (input && typeof input === "object") {
                for (const [key, value] of Object.entries(input)) {
                  if (baseRoute.includes(`[${key}]`)) {
                    baseRoute = baseRoute.replace(`[${key}]`, String(value));
                  }
                }
              }

              await mutate(
                (key) => typeof key === "string" && key.startsWith(baseRoute),
                undefined,
                { revalidate: true }
              );
            }

            return result;
          } catch (error) {
            if (options?.rollbackOnError !== false && options?.optimisticData) {
              await mutate(String(route));
            }
            throw error;
          }
        },
        [mutationFn, route]
      );

      return { trigger, mutate: mutationFn };
    },
  };
}
