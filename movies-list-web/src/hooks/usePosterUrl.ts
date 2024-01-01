import { useEffect, useState } from "react";
import { getPoster } from "services/api";
import { getToken } from "services/session";

// Posters need the bearer token, so they are fetched as blobs and shown through short-lived object URLs.
export const usePosterUrl = (movieId?: string): string => {
  const [poster, setPoster] = useState<{ id: string; url: string } | null>(null);

  useEffect(() => {
    if (!movieId) return;
    let url = "";
    let cancelled = false;
    getPoster(movieId, getToken())
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setPoster({ id: movieId, url });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [movieId]);

  return poster && poster.id === movieId ? poster.url : "";
};
