import type { Listing } from "@/types/listing";

export const getApiOrigin = (baseUrl: string) => {
  try {
    return new URL(baseUrl).origin;
  } catch {
    return "http://localhost:8080";
  }
};

const decodeBase64Json = (value: string) => {
  try {
    if (typeof window !== "undefined" && typeof window.atob === "function") {
      return window.atob(value);
    }
  } catch {
    return "";
  }

  return "";
};

const parseImageValue = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((image): image is string => typeof image === "string");
  }

  if (typeof value !== "string") {
    return [];
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith("[") || trimmed.startsWith("\"")) {
    try {
      return parseImageValue(JSON.parse(trimmed));
    } catch {
      return [trimmed];
    }
  }

  const decoded = decodeBase64Json(trimmed);
  if (decoded) {
    const decodedImages = parseImageValue(decoded);
    if (decodedImages.length > 0) {
      return decodedImages;
    }
  }

  return [trimmed];
};

export const normalizeListingImageUrl = (image: string, apiOrigin: string) => {
  if (/^https?:\/\//i.test(image) || image.startsWith("data:")) {
    return image;
  }

  const normalized = image.replaceAll("\\", "/").replace(/^\.\//, "");
  const fileName = normalized.split("/").filter(Boolean).pop();

  if (normalized.startsWith("/listing-files/")) {
    return `${apiOrigin}${normalized}`;
  }

  if (normalized.startsWith("/files/")) {
    return `${apiOrigin}${normalized}`;
  }

  if (normalized.startsWith("listings/") && fileName) {
    return `${apiOrigin}/listing-files/${fileName}`;
  }

  return image;
};

export const normalizeListing = <T extends Listing>(
  listing: T,
  baseUrl: string,
): T => {
  const apiOrigin = getApiOrigin(baseUrl);
  const imageUrls = parseImageValue(listing.image).map((image) =>
    normalizeListingImageUrl(image, apiOrigin),
  );

  return {
    ...listing,
    imageUrls,
  };
};

export const getListingPrimaryImage = (listing: Listing) =>
  listing.imageUrls?.[0] ?? null;

export const getListingPlaceholderImage = (title: string, price: number) => {
  const palette = [
    ["#0f4c81", "#4f83ff"],
    ["#c65d00", "#ffb347"],
    ["#12664f", "#52b788"],
    ["#5a189a", "#9d4edd"],
  ];
  const seed = title
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);
  const [startColor, endColor] = palette[seed % palette.length];
  const initials =
    title
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("") || "SS";
  const safeTitle = title.slice(0, 28);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${startColor}" />
          <stop offset="100%" stop-color="${endColor}" />
        </linearGradient>
      </defs>
      <rect width="640" height="400" rx="36" fill="url(#g)" />
      <circle cx="540" cy="86" r="86" fill="rgba(255,255,255,0.14)" />
      <circle cx="126" cy="338" r="112" fill="rgba(255,255,255,0.1)" />
      <text x="68" y="168" fill="white" font-family="Arial, sans-serif" font-size="88" font-weight="700">${initials}</text>
      <text x="68" y="248" fill="rgba(255,255,255,0.92)" font-family="Arial, sans-serif" font-size="34" font-weight="600">${safeTitle}</text>
      <text x="68" y="302" fill="rgba(255,255,255,0.78)" font-family="Arial, sans-serif" font-size="24">SwampSwap Listing</text>
      <text x="68" y="352" fill="white" font-family="Arial, sans-serif" font-size="28" font-weight="700">$${price}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const getListingImageSrc = (listing: Listing) =>
  getListingPrimaryImage(listing) ??
  getListingPlaceholderImage(listing.title, listing.price);
