import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUserInfo } from "@/api/user";
import type { UserInfo } from "@/types/user";

function UserPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState("1");

  const fetchUserInfo = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserInfo(id);
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo(userId);
  }, []);

  const handleSearch = () => {
    fetchUserInfo(userId);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl">
        {/* Back button and user ID input */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => window.history.back()}>
            ← Back
          </Button>
          
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-32"
            />
            <Button onClick={handleSearch} disabled={loading}>
              Search
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive bg-destructive/10 p-4">
            <div className="text-sm text-destructive">{error}</div>
          </div>
        )}

        {user && (
          <div className="rounded-lg border bg-card p-8 shadow-sm">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
                  alt={user.username}
                  className="h-32 w-32 rounded-full border-4 border-primary/10"
                />
              </div>

              {/* User details */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-foreground">{user.username}</h1>
                <p className="text-muted-foreground">Joined {formatDate(user.joinedAt)}</p>
                {user.bio && (
                  <p className="mt-2 text-muted-foreground">{user.bio}</p>
                )}
                <div className="mt-4 flex justify-center gap-8 sm:justify-start">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{user.stats.itemsPosted}</div>
                    <div className="text-sm text-muted-foreground">Items Posted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{user.stats.itemsSold}</div>
                    <div className="text-sm text-muted-foreground">Items Sold</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className="mt-8 border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-foreground">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default UserPage;
