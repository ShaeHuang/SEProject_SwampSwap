import type { ConversationItem, Message } from "@/types/message";
import { getUserInfo } from "@/api/user";

const mockMessages: Message[] = [
  { id: "1", senderId: "1", receiverId: "2", content: "Hey, I saw your listing, still available?", createdAt: "2026-03-01T10:15:00Z", isRead: true },
  { id: "2", senderId: "2", receiverId: "1", content: "Yes, still available. When can you pick up?", createdAt: "2026-03-01T10:18:00Z", isRead: true },
  { id: "3", senderId: "1", receiverId: "2", content: "Tonight works for me.", createdAt: "2026-03-01T10:20:00Z", isRead: false },
  { id: "4", senderId: "1", receiverId: "3", content: "Can you share more pictures?", createdAt: "2026-03-02T08:30:00Z", isRead: false },
];

const USER_ID = "1";

export const getConversations = async (): Promise<ConversationItem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const myConversations: Record<string, Message[]> = {};

  for (const msg of mockMessages) {
    if (msg.senderId === USER_ID || msg.receiverId === USER_ID) {
      const otherId = msg.senderId === USER_ID ? msg.receiverId : msg.senderId;
      if (!myConversations[otherId]) myConversations[otherId] = [];
      myConversations[otherId].push(msg);
    }
  }

  const convos: ConversationItem[] = [];

  for (const otherId of Object.keys(myConversations)) {
    const messages = myConversations[otherId].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const last = messages[messages.length - 1];
    const unreadCount = messages.filter((m) => !m.isRead && m.receiverId === USER_ID).length;

    const otherProfile = await getUserInfo(otherId).catch(() => null);

    convos.push({
      userId: otherId,
      username: otherProfile?.username || `User ${otherId}`,
      avatar: otherProfile?.avatar,
      lastMessage: last.content,
      lastAt: last.createdAt,
      unreadCount,
    });
  }

  return convos.sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
};

export const getConversationWithUser = async (otherUserId: string): Promise<Message[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const thread = mockMessages
    .filter(
      (msg) =>
        (msg.senderId === USER_ID && msg.receiverId === otherUserId) ||
        (msg.senderId === otherUserId && msg.receiverId === USER_ID)
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return thread;
};

export const sendMessage = async (receiverId: string, content: string): Promise<Message> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newMessage: Message = {
    id: String(mockMessages.length + 1),
    senderId: USER_ID,
    receiverId,
    content,
    createdAt: new Date().toISOString(),
    isRead: false,
  };
  mockMessages.push(newMessage);

  return newMessage;
};
