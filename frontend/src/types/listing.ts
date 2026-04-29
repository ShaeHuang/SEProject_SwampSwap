export type ListingStatus = "available" | "sold";

export type ListingSort = "latest" | "oldest" | "price_asc" | "price_desc";

export type ListingFilterStatus = ListingStatus | "all";

export const listingCategories = [
  "Digital Product",
  "Furniture",
  "Cooking",
  "Clothing",
  "Sports",
  "Cars",
] as const;

export type ListingCategory = (typeof listingCategories)[number];

export const listingConditions = [
  "New",
  "Like new",
  "Open box",
  "Gently used",
  "Used",
  "Fair",
] as const;

export type ListingCondition = (typeof listingConditions)[number];

export interface Listing {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  title: string;
  description: string;
  price: number;
  category: ListingCategory;
  condition: ListingCondition;
  user_id: number;
  status: ListingStatus;
  image?: string | string[] | null;
  imageUrls?: string[];
  seller_name?: string;
  seller_avatar?: string;
}

export interface ListingQueryParams {
  search?: string;
  sort?: ListingSort;
  status?: ListingFilterStatus;
  category?: ListingCategory;
}

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  category: ListingCategory;
  condition: ListingCondition;
  images?: File[];
}
