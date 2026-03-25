import type { UserInfo } from "@/types/user";

/**
 * Get user information from backend API
 * @param userId User ID
 * @returns Promise<UserInfo>
 */
export const getUserInfo = async (userId: string): Promise<UserInfo> => {
    const response = await fetch(`/api/user/${userId}`, {
        credentials: 'include'
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("User not found");
        }
        throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }

    const data = await response.json();
    return data as UserInfo;
};
