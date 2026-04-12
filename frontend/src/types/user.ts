// user info type definition
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  joinedAt: string;
  stats: {
    itemsPosted: number;
    itemsSold: number;
  };
}

export interface CurrentUserProfile {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  joinedAt: string;
}

export interface UpdateCurrentUserProfileData {
  username?: string;
  email?: string;
  avatar?: string;
  bio?: string;
}
