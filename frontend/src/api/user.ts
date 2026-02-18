import type { UserInfo } from "@/types/user";

// Mock database
const mockUsers: Record<string, UserInfo> = {
    "1": {
        id: "1",
        username: "Zhang San",
        email: "zhangsan@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang",
        bio: "Love secondhand trading, looking for great value items! 🎒",
        joinedAt: "2025-09-01T00:00:00Z",
        stats: {
            itemsPosted: 12,
            itemsSold: 8,
        },
    },
    "2": {
        id: "2",
        username: "Li Si",
        email: "lisi@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Li",
        bio: "Liquidating after graduation, feel free to inquire!",
        joinedAt: "2025-10-15T00:00:00Z",
        stats: {
            itemsPosted: 5,
            itemsSold: 3,
        },
    },
};

/**
 * Get user information (mock API)
 * @param userId User ID
 * @returns Promise<UserInfo>
 */
export const getUserInfo = async (userId: string): Promise<UserInfo> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers[userId];
    
    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

/**
 * Update user information (mock API)
 * @param userId User ID
 * @param updates Fields to update
 * @returns Promise<UserInfo>
 */
export const updateUserInfo = async (
    userId: string,
    updates: Partial<Omit<UserInfo, "id" | "stats" | "joinedAt">>
): Promise<UserInfo> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers[userId];
    
    if (!user) {
        throw new Error("User not found");
    }

    // Update user information
    mockUsers[userId] = { ...user, ...updates };

    return mockUsers[userId];
};
