import type {
  CreateListingData,
  Listing,
  ListingQueryParams,
} from "@/types/listing";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

const getToken = () => localStorage.getItem("token");

const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

const readJson = async <T>(response: Response): Promise<T> => {
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error ?? "Request failed");
  }

  return json as T;
};

export const isAuthenticated = () => Boolean(getToken());

export const listListings = async (
  // Query params kept for future backend support
  _params?: ListingQueryParams,
): Promise<Listing[]> => {
  const response = await fetch(`${BASE_URL}/listings`);

  return readJson<Listing[]>(response);
};

export const getListingById = async (id: string): Promise<Listing> => {
  const response = await fetch(`${BASE_URL}/listings/${id}`);

  return readJson<Listing>(response);
};

export const createListing = async (
  data: CreateListingData,
): Promise<Listing> => {
  const response = await fetch(`${BASE_URL}/listings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  return readJson<Listing>(response);
};

export const updateListing = async (
  id: number,
  data: CreateListingData,
): Promise<Listing> => {
  const response = await fetch(`${BASE_URL}/listings/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  return readJson<Listing>(response);
};

export const deleteListing = async (id: number): Promise<void> => {
  const response = await fetch(`${BASE_URL}/listings/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const json = await response.json();
    throw new Error(json.error ?? "Failed to delete listing");
  }
};

export const buyListing = async (id: number): Promise<Listing> => {
  const response = await fetch(`${BASE_URL}/listings/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ status: "sold" }),
  });

  return readJson<Listing>(response);
};

export const defaultListingSort = "latest" as const;
export const defaultListingStatus = "all" as const;
