export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead?: boolean;
}

export interface ConversationItem {
  userId: string;
  username: string;
  avatar?: string;
  lastMessage: string;
  lastAt: string;
  unreadCount: number;
}
