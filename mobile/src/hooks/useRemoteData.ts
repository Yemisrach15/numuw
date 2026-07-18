import { useCallback, useEffect, useState } from "react";

type AsyncStatus = "idle" | "loading" | "success" | "error";

export function useRemoteData<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<AsyncStatus>("loading");
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const nextData = await loader();
      setData(nextData);
      setStatus("success");
      return nextData;
    } catch (cause) {
      const nextError =
        cause instanceof Error ? cause : new Error("Request failed.");
      setError(nextError);
      setStatus("error");
      throw nextError;
    }
  }, [loader]);

  const refetch = useCallback(async () => loadData(), [loadData]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const nextData = await loader();
        if (cancelled) {
          return;
        }

        setData(nextData);
        setStatus("success");
      } catch (cause) {
        if (cancelled) {
          return;
        }

        const nextError =
          cause instanceof Error ? cause : new Error("Request failed.");
        setError(nextError);
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loader]);

  return {
    data,
    error,
    isLoading: status === "loading" && data === null,
    isFetching: status === "loading" && data !== null,
    refetch,
    setData,
  };
}
