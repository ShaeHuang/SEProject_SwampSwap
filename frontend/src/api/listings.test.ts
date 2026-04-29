import { describe, expect, it, vi } from "vitest";

import { createListing } from "@/api/listings";

describe("listing API", () => {
  it("uses backend-compatible multipart field names when uploading listing photos", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        ID: 1,
        CreatedAt: "2026-04-29T12:00:00Z",
        UpdatedAt: "2026-04-29T12:00:00Z",
        DeletedAt: null,
        title: "Desk Lamp",
        description: "Bright lamp",
        price: 25,
        category: "Furniture",
        condition: "Like new",
        user_id: 1,
        status: "available",
        image: null,
      }),
    } as Response);

    await createListing({
      title: "Desk Lamp",
      description: "Bright lamp",
      price: 25,
      category: "Furniture",
      condition: "Like new",
      images: [new File(["image"], "lamp.jpg", { type: "image/jpeg" })],
    });

    const body = fetchMock.mock.calls[0]?.[1]?.body;
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("Title")).toBe("Desk Lamp");
    expect((body as FormData).get("Description")).toBe("Bright lamp");
    expect((body as FormData).get("Price")).toBe("25");
    expect((body as FormData).get("Category")).toBe("Furniture");
    expect((body as FormData).get("Condition")).toBe("Like new");
    expect((body as FormData).get("image")).toBeInstanceOf(File);

    fetchMock.mockRestore();
  });
});
