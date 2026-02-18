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
