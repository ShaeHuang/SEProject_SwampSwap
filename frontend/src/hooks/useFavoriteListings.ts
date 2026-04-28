import { useCallback, useEffect, useMemo, useState } from "react";

import {
  FAVORITE_LISTINGS_CHANGED_EVENT,
  FAVORITE_LISTINGS_STORAGE_KEY,
  readFavoriteListingIds,
  toggleFavoriteListing,
} from "@/lib/favorite-listings";

export const useFavoriteListings = () => {
  const [favoriteListingIds, setFavoriteListingIds] = useState<number[]>(() =>
    readFavoriteListingIds(),
  );

  useEffect(() => {
    const refreshFavorites = () => {
      setFavoriteListingIds(readFavoriteListingIds());
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === FAVORITE_LISTINGS_STORAGE_KEY) {
        refreshFavorites();
      }
    };

    window.addEventListener(FAVORITE_LISTINGS_CHANGED_EVENT, refreshFavorites);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(FAVORITE_LISTINGS_CHANGED_EVENT, refreshFavorites);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const favoriteListingIdSet = useMemo(
    () => new Set(favoriteListingIds),
    [favoriteListingIds],
  );

  const isFavorite = useCallback(
    (listingId: number) => favoriteListingIdSet.has(listingId),
    [favoriteListingIdSet],
  );

  const toggleFavorite = useCallback((listingId: number) => {
    const nextIds = toggleFavoriteListing(listingId);
    setFavoriteListingIds(nextIds);
  }, []);

  return {
    favoriteListingIds,
    isFavorite,
    toggleFavorite,
  };
};
