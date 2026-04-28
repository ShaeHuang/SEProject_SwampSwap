import { describe, expect, it } from "vitest";

import { normalizeListing } from "./listing-images";
import type { Listing } from "@/types/listing";

const baseListing: Listing = {
  ID: 1,
  CreatedAt: "2025-01-01T00:00:00Z",
  UpdatedAt: "2025-01-01T00:00:00Z",
  DeletedAt: null,
  title: "Desk Lamp",
  description: "Warm light",
  price: 25,
  category: "Furniture",
  condition: "Gently used",
  user_id: 1,
  status: "available",
};

describe("normalizeListing", () => {
  it("decodes backend base64 JSON image lists into listing file URLs", () => {
    const image = btoa(JSON.stringify(["listings/lamp.jpg", "listings/lamp2.jpg"]));

    const listing = normalizeListing(
      {
        ...baseListing,
        image,
      },
      "http://localhost:8080/api",
    );

    expect(listing.imageUrls).toEqual([
      "http://localhost:8080/listing-files/lamp.jpg",
      "http://localhost:8080/listing-files/lamp2.jpg",
    ]);
  });

  it("keeps compatibility with raw JSON image list strings", () => {
    const listing = normalizeListing(
      {
        ...baseListing,
        image: JSON.stringify(["listings/lamp.jpg"]),
      },
      "http://localhost:8080/api",
    );

    expect(listing.imageUrls).toEqual([
      "http://localhost:8080/listing-files/lamp.jpg",
    ]);
  });
});
