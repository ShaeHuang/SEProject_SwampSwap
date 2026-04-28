import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  FAVORITE_LISTINGS_CHANGED_EVENT,
  FAVORITE_LISTINGS_STORAGE_KEY,
  isFavoriteListing,
  normalizeFavoriteListingIds,
  parseFavoriteListingIds,
  readFavoriteListingIds,
  toggleFavoriteListing,
  writeFavoriteListingIds,
} from "@/lib/favorite-listings";

describe("favorite listings storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("normalizes ids and removes duplicates", () => {
    expect(normalizeFavoriteListingIds([1, "2", 2, 0, -1, "x", 3.5])).toEqual([
      1,
      2,
    ]);
  });

  it("returns an empty list for missing or malformed storage", () => {
    expect(parseFavoriteListingIds(null)).toEqual([]);
    expect(parseFavoriteListingIds("not json")).toEqual([]);
    expect(parseFavoriteListingIds(JSON.stringify({ ids: [1] }))).toEqual([]);
  });

  it("writes and reads favorite listing ids", () => {
    writeFavoriteListingIds([3, 1, 3]);

    expect(readFavoriteListingIds()).toEqual([3, 1]);
    expect(localStorage.getItem(FAVORITE_LISTINGS_STORAGE_KEY)).toBe("[3,1]");
  });

  it("toggles favorite listing ids", () => {
    expect(toggleFavoriteListing(5)).toEqual([5]);
    expect(isFavoriteListing(5)).toBe(true);

    expect(toggleFavoriteListing(8)).toEqual([5, 8]);
    expect(toggleFavoriteListing(5)).toEqual([8]);
    expect(isFavoriteListing(5)).toBe(false);
  });

  it("dispatches an event when favorites change", () => {
    const listener = vi.fn();
    window.addEventListener(FAVORITE_LISTINGS_CHANGED_EVENT, listener);

    writeFavoriteListingIds([1]);

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(FAVORITE_LISTINGS_CHANGED_EVENT, listener);
  });
});
