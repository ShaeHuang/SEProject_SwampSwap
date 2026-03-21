import type {
  CreateListingData,
  Listing,
  ListingFilterStatus,
  ListingQueryParams,
  ListingSort,
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
  params: ListingQueryParams = {},
): Promise<Listing[]> => {
  const searchParams = new URLSearchParams();

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.sort) {
    searchParams.set("sort", params.sort);
  }

  if (params.status && params.status !== "all") {
    searchParams.set("status", params.status);
  }

  const queryString = searchParams.toString();
  const response = await fetch(
    `${BASE_URL}/listings${queryString ? `?${queryString}` : ""}`,
  );

  return readJson<Listing[]>(response);
};

export const getListingById = async (id: string): Promise<Listing> => {
  const response = await fetch(`${BASE_URL}/listings/${id}`);

  return readJson<Listing>(response);
};

export const createListing = async (
  data: CreateListingData,
): Promise<Listing> => {
  const response = await fetch(`${BASE_URL}/admin/listings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  return readJson<Listing>(response);
};

export const buyListing = async (id: number): Promise<Listing> => {
  const response = await fetch(`${BASE_URL}/admin/listings/${id}/buy`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
  });

  return readJson<Listing>(response);
};

export const defaultListingSort: ListingSort = "latest";
export const defaultListingStatus: ListingFilterStatus = "all";
