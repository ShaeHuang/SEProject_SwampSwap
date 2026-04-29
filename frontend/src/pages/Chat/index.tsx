import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getConversationWithUser, getConversations, sendMessage } from "@/api/message";
import { getUserInfo } from "@/api/user";
import type { ConversationItem, Message } from "@/types/message";
import type { UserInfo } from "@/types/user";

function ChatPage() {
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(
    searchParams.get("userId") ?? "",
  );
  const [selectedUserInfo, setSelectedUserInfo] = useState<UserInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState(searchParams.get("draft") ?? "");
  const [loading, setLoading] = useState(false);
  const draftListingTitle = searchParams.get("listingTitle");

  const loadConversations = useCallback(async () => {
    setLoading(true);
    const convos = await getConversations();
    setConversations(convos);
    setSelectedUserId((currentUserId) => currentUserId || convos[0]?.userId || "");
    setLoading(false);
  }, []);

  const loadThread = useCallback(async (userId: string) => {
    setLoading(true);
    const user = await getUserInfo(userId).catch(() => null);
    setSelectedUserInfo(user);
    const thread = await getConversationWithUser(userId);
    setMessages(thread);
    setLoading(false);
  }, []);

  const refreshCurrentConversation = async () => {
    const currentUserId = selectedUserId;

    await loadConversations();

    if (currentUserId) {
      await loadThread(currentUserId);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadConversations();
    };
    init();
  }, [loadConversations]);

  useEffect(() => {
    const nextUserId = searchParams.get("userId") ?? "";
    const nextDraft = searchParams.get("draft") ?? "";

    if (nextUserId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedUserId(nextUserId);
    }

    setNewMessage(nextDraft);
  }, [searchParams]);

  useEffect(() => {
    const updateThread = async () => {
      if (!selectedUserId) return;
      await loadThread(selectedUserId);
    };
    updateThread();
  }, [loadThread, selectedUserId]);

  const sortedConversations = useMemo(() => {
    const items = [...conversations];

    if (
      selectedUserId &&
      selectedUserInfo &&
      !items.some((item) => item.userId === selectedUserId)
    ) {
      items.unshift({
        userId: selectedUserId,
        username: selectedUserInfo.username,
        avatar: selectedUserInfo.avatar,
        lastMessage: "Start a conversation about this item.",
        lastAt: new Date().toISOString(),
        unreadCount: 0,
      });
    }

    return items.sort(
      (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime(),
    );
  }, [conversations, selectedUserId, selectedUserInfo]);

  const onSend = async () => {
    if (!selectedUserId || !newMessage.trim()) return;
    await sendMessage(selectedUserId, newMessage.trim());
    setNewMessage("");
    await loadThread(selectedUserId);
    await loadConversations();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Conversations</h2>
          {loading && !messages.length ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : sortedConversations.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No conversations yet. Message a seller to start one.
            </p>
          ) : (
            <ul className="space-y-2">
              {sortedConversations.map((item) => (
                <li key={item.userId}>
                  <button
                    className={`w-full rounded-lg border px-3 py-2 text-left ${selectedUserId === item.userId ? "border-primary bg-primary/10" : "hover:border-muted"}`}
                    onClick={() => setSelectedUserId(item.userId)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.username}</span>
                      {item.unreadCount > 0 && (
                        <span className="rounded-full bg-destructive px-2 py-1 text-xs text-white">{item.unreadCount}</span>
                      )}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{item.lastMessage}</p>
                    <p className="text-xs text-muted-foreground">{new Date(item.lastAt).toLocaleString()}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Chat</h2>
            <Button variant="outline" size="sm" onClick={refreshCurrentConversation}>Refresh</Button>
          </div>
          {selectedUserInfo ? (
            <div className="mb-3 flex items-center gap-3 border-b pb-3">
              <img src={selectedUserInfo.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"} alt={selectedUserInfo.username} className="h-10 w-10 rounded-full" />
              <div>
                <p className="font-medium">{selectedUserInfo.username}</p>
                <p className="text-xs text-muted-foreground">{selectedUserInfo.email}</p>
                {draftListingTitle && (
                  <p className="text-xs text-muted-foreground">
                    Discussing: {draftListingTitle}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select conversation to load messages</p>
          )}

          <div className="mb-4 h-[460px] overflow-auto rounded-md border p-3">
            {loading && <p className="text-sm text-muted-foreground">Loading messages...</p>}
            {!loading && messages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
            <div className="space-y-2">
              {messages.map((msg) => {
                const isMine = msg.senderId !== selectedUserId;
                return (
                  <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-xl px-3 py-2 ${isMine ? "bg-primary text-white" : "bg-muted text-foreground"}`}>
                      <p>{msg.content}</p>
                      <p className="mt-1 text-right text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border px-3 py-2"
            />
            <Button onClick={onSend}>Send</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
