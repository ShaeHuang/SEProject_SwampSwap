export type ListingStatus = "available" | "sold";

export type ListingSort = "latest" | "oldest" | "price_asc" | "price_desc";

export type ListingFilterStatus = ListingStatus | "all";

export interface Listing {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  price: number;
  user_id: number;
  status: ListingStatus;
  buyer_id: number | null;
  seller_username: string;
}

export interface ListingQueryParams {
  search?: string;
  sort?: ListingSort;
  status?: ListingFilterStatus;
}

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
}
