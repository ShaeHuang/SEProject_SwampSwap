import type { ConversationItem, Message } from "@/types/message";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

const getToken = () => localStorage.getItem("token");

const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

export const getConversations = async (): Promise<ConversationItem[]> => {
  const response = await fetch(`${BASE_URL}/messages`, {
    headers: { ...getAuthHeaders() },
  });

  if (!response.ok) {
    if (response.status === 401) return [];
    throw new Error("Failed to load conversations");
  }

  return response.json();
};

export const getConversationWithUser = async (
  otherUserId: string
): Promise<Message[]> => {
  const response = await fetch(`${BASE_URL}/messages/${otherUserId}`, {
    headers: { ...getAuthHeaders() },
  });

  if (!response.ok) {
    if (response.status === 401) return [];
    throw new Error("Failed to load messages");
  }

  return response.json();
};

export const sendMessage = async (
  receiverId: string,
  content: string
): Promise<Message> => {
  const response = await fetch(`${BASE_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      receiver_id: Number(receiverId),
      content,
    }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error ?? "Failed to send message");
  }

  return json;
};