export type ListingStatus = "available" | "sold";

export type ListingSort = "latest" | "oldest" | "price_asc" | "price_desc";

export type ListingFilterStatus = ListingStatus | "all";

export interface Listing {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  title: string;
  description: string;
  price: number;
  user_id: number;
  status: ListingStatus;
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
