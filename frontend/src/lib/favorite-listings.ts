export const FAVORITE_LISTINGS_STORAGE_KEY = "swampswap.favoriteListingIds";
export const FAVORITE_LISTINGS_CHANGED_EVENT = "swampswap:favorite-listings-changed";

const getFavoriteStorage = (): Storage | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
};

export const normalizeFavoriteListingIds = (value: unknown): number[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const ids = value
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);

  return Array.from(new Set(ids));
};

export const parseFavoriteListingIds = (rawValue: string | null): number[] => {
  if (!rawValue) {
    return [];
  }

  try {
    return normalizeFavoriteListingIds(JSON.parse(rawValue));
  } catch {
    return [];
  }
};

export const readFavoriteListingIds = (
  storage: Storage | null = getFavoriteStorage(),
): number[] => {
  if (!storage) {
    return [];
  }

  return parseFavoriteListingIds(storage.getItem(FAVORITE_LISTINGS_STORAGE_KEY));
};

const notifyFavoriteListingChange = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(FAVORITE_LISTINGS_CHANGED_EVENT));
};

export const writeFavoriteListingIds = (
  listingIds: number[],
  storage: Storage | null = getFavoriteStorage(),
): number[] => {
  const normalizedIds = normalizeFavoriteListingIds(listingIds);

  if (storage) {
    storage.setItem(FAVORITE_LISTINGS_STORAGE_KEY, JSON.stringify(normalizedIds));
  }

  notifyFavoriteListingChange();
  return normalizedIds;
};

export const isFavoriteListing = (
  listingId: number,
  storage: Storage | null = getFavoriteStorage(),
): boolean => readFavoriteListingIds(storage).includes(listingId);

export const toggleFavoriteListing = (
  listingId: number,
  storage: Storage | null = getFavoriteStorage(),
): number[] => {
  const currentIds = readFavoriteListingIds(storage);
  const nextIds = currentIds.includes(listingId)
    ? currentIds.filter((id) => id !== listingId)
    : [...currentIds, listingId];

  return writeFavoriteListingIds(nextIds, storage);
};
