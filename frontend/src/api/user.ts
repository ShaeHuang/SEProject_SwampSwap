import type { Listing } from "@/types/listing";
import type {
  CurrentUserProfile,
  UpdateCurrentUserProfileData,
  UserInfo,
} from "@/types/user";

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

/**
 * Get user information from backend API
 * @param userId User ID
 * @returns Promise<UserInfo>
 */
export const getUserInfo = async (userId: string): Promise<UserInfo> => {
    const response = await fetch(`${BASE_URL}/user/${userId}`);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("User not found");
        }
        throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }

    const data = await response.json();
    return data as UserInfo;
};

export const getCurrentUserProfile = async (): Promise<CurrentUserProfile> => {
  const response = await fetch(`${BASE_URL}/user`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error ?? "Failed to fetch current user");
  }

  return {
    id: json.data.ID,
    username: json.data.username,
    email: json.data.email,
    avatar: json.data.avatar,
    bio: json.data.bio,
    joinedAt: json.data.CreatedAt,
  };
};

export const getCurrentUserListings = async (): Promise<Listing[]> => {
  const response = await fetch(`${BASE_URL}/user/listings`, {
    headers: {
      ...getAuthHeaders(),
    },
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error ?? "Failed to fetch user listings");
  }

  return json.data as Listing[];
};

export const updateCurrentUserProfile = async (
  data: UpdateCurrentUserProfileData,
): Promise<CurrentUserProfile> => {
  const response = await fetch(`${BASE_URL}/user`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error ?? "Failed to update current user");
  }

  return {
    id: json.user.ID,
    username: json.user.username,
    email: json.user.email,
    avatar: json.user.avatar,
    bio: json.user.bio,
    joinedAt: json.user.CreatedAt,
  };
};
