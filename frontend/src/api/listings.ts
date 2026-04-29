import type {
  CreateListingData,
  Listing,
  ListingQueryParams,
} from "@/types/listing";
import { normalizeListing } from "@/lib/listing-images";

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

const hasListingImages = (data: CreateListingData) =>
  Boolean(data.images && data.images.length > 0);

const buildListingFormData = (data: CreateListingData) => {
  const formData = new FormData();

  formData.append("Title", data.title);
  formData.append("Description", data.description);
  formData.append("Price", String(data.price));
  formData.append("Category", data.category);
  formData.append("Condition", data.condition);

  data.images?.forEach((image) => {
    formData.append("image", image);
  });

  return formData;
};

export const isAuthenticated = () => Boolean(getToken());

export const listListings = async (
  // Query params kept for future backend support
  params?: ListingQueryParams,
): Promise<Listing[]> => {
  void params;
  const response = await fetch(`${BASE_URL}/listings`);

  const listings = await readJson<Listing[]>(response);
  return listings.map((listing) => normalizeListing(listing, BASE_URL));
};

export const getListingById = async (id: string): Promise<Listing> => {
  const response = await fetch(`${BASE_URL}/listings/${id}`);

  return normalizeListing(await readJson<Listing>(response), BASE_URL);
};

export const createListing = async (
  data: CreateListingData,
): Promise<Listing> => {
  const hasImages = hasListingImages(data);
  const response = await fetch(`${BASE_URL}/listings`, {
    method: "POST",
    headers: hasImages
      ? {
          ...getAuthHeaders(),
        }
      : {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
    body: hasImages ? buildListingFormData(data) : JSON.stringify(data),
  });

  return normalizeListing(await readJson<Listing>(response), BASE_URL);
};

export const updateListing = async (
  id: number,
  data: CreateListingData,
): Promise<Listing> => {
  const hasImages = hasListingImages(data);
  const response = await fetch(`${BASE_URL}/listings/${id}`, {
    method: "PUT",
    headers: hasImages
      ? {
          ...getAuthHeaders(),
        }
      : {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
    body: hasImages ? buildListingFormData(data) : JSON.stringify(data),
  });

  return normalizeListing(await readJson<Listing>(response), BASE_URL);
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

  return normalizeListing(await readJson<Listing>(response), BASE_URL);
};

export const defaultListingSort = "latest" as const;
export const defaultListingStatus = "all" as const;
