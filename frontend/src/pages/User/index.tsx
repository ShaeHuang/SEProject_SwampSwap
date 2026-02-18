import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getUserInfo } from "@/api/user";
import type { UserInfo } from "@/types/user";

function UserPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState("1");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUserInfo(currentUserId);
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [currentUserId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="text-lg text-destructive">{error}</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl">
        {/* Back button and demo tools */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => window.history.back()}>
            ← Back
          </Button>
          
          {/* Demo: Switch users */}
          <div className="flex gap-2">
            <span className="text-sm text-muted-foreground">Demo switch:</span>
            <Button
              size="sm"
              variant={currentUserId === "1" ? "default" : "outline"}
              onClick={() => setCurrentUserId("1")}
            >
              User 1
            </Button>
            <Button
              size="sm"
              variant={currentUserId === "2" ? "default" : "outline"}
              onClick={() => setCurrentUserId("2")}
            >
              User 2
            </Button>
          </div>
        </div>

        {/* User info card */}
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
              <h1 className="text-3xl font-bold tracking-tight">{user.username}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
              
              {user.bio && (
                <p className="mt-4 text-base leading-relaxed">{user.bio}</p>
              )}

              <div className="mt-4 text-sm text-muted-foreground">
                Joined: {formatDate(user.joinedAt)}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t pt-6">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <div className="text-3xl font-bold text-primary">{user.stats.itemsPosted}</div>
              <div className="mt-1 text-sm text-muted-foreground">Items Posted</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <div className="text-3xl font-bold text-primary">{user.stats.itemsSold}</div>
              <div className="mt-1 text-sm text-muted-foreground">Items Sold</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex gap-3">
            <Button className="flex-1">Edit Profile</Button>
            <Button variant="outline" className="flex-1">
              View Items
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserPage;
