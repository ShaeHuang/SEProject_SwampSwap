import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getCurrentUser, type CurrentUser } from "@/api/auth";
import { isAuthenticated, listListings } from "@/api/listings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import { cn } from "@/lib/utils";
import type { Listing } from "@/types/listing";
import { toast } from "sonner";

function FavoritesPage() {
  const navigate = useNavigate();
  const { favoriteListingIds, isFavorite, toggleFavorite } = useFavoriteListings();
  const [listings, setListings] = useState<Listing[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listListings();
        setListings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load saved listings");
      } finally {
        setLoading(false);
      }
    };

    void fetchListings();
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!isAuthenticated()) {
        setCurrentUser(null);
        return;
      }

      const user = await getCurrentUser().catch(() => null);
      setCurrentUser(user);
    };

    void fetchCurrentUser();
  }, []);

  const savedListings = useMemo(() => {
    const favoriteIdSet = new Set(favoriteListingIds);

    return listings
      .filter((listing) => favoriteIdSet.has(listing.ID))
      .sort(
        (left, right) =>
          favoriteListingIds.indexOf(left.ID) - favoriteListingIds.indexOf(right.ID),
      );
  }, [favoriteListingIds, listings]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);

  const contactSeller = async (listing: Listing) => {
    if (!isAuthenticated()) {
      toast.error("Please log in before messaging a seller.");
      navigate("/login");
      return;
    }

    const activeUser =
      currentUser ??
      (await getCurrentUser().catch(() => null));

    if (activeUser) {
      setCurrentUser(activeUser);
    }

    if (activeUser?.id === listing.user_id) {
      toast.error("This is your listing.");
      return;
    }

    const sellerName = listing.seller_name || "";
    const params = new URLSearchParams({
      userId: String(listing.user_id),
      listingTitle: listing.title,
      draft: `Hi ${sellerName}, I'm interested in your listing "${listing.title}". Is it still available?`,
    });

    navigate(`/chat?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(0,82,255,0.08),transparent_32%),linear-gradient(135deg,rgba(255,125,0,0.08),transparent_52%),var(--background)] px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Saved Listings</h1>
            <p className="text-muted-foreground">Items you want to revisit.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate("/listings")}>
              Marketplace
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Home
            </Button>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Loading saved listings...
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="space-y-4 py-10 text-center">
              <p className="text-destructive">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        ) : savedListings.length === 0 ? (
          <Card>
            <CardContent className="space-y-4 py-12 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Heart className="size-5" />
              </div>
              <div>
                <p className="text-lg font-medium">No saved listings yet.</p>
                <p className="text-muted-foreground">
                  Save items from the marketplace to see them here.
                </p>
              </div>
              <Button onClick={() => navigate("/listings")}>Browse Listings</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {savedListings.map((listing) => {
              const isSold = listing.status === "sold";
              const isOwnListing = currentUser?.id === listing.user_id;
              const saved = isFavorite(listing.ID);

              return (
                <Card key={listing.ID} className="border-primary/10">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <CardTitle className="truncate text-xl">{listing.title}</CardTitle>
                        <CardDescription>
                          Sold by {listing.seller_name || `User #${listing.user_id}`}
                        </CardDescription>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          type="button"
                          variant={saved ? "secondary" : "outline"}
                          size="icon-sm"
                          aria-label={
                            saved
                              ? `Remove ${listing.title} from saved listings`
                              : `Save ${listing.title}`
                          }
                          onClick={() => toggleFavorite(listing.ID)}
                        >
                          <Heart className={cn("size-4", saved && "fill-current")} />
                        </Button>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isSold
                              ? "bg-muted text-muted-foreground"
                              : "bg-secondary/15 text-secondary"
                          }`}
                        >
                          {isSold ? "Sold" : "Available"}
                        </span>
                      </div>
                    </div>
                    <div className="text-3xl font-semibold text-primary">
                      {formatPrice(listing.price)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {listing.category}
                      </span>
                      <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">
                        Condition: {listing.condition}
                      </span>
                    </div>
                    <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {listing.description}
                    </p>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-3">
                    <Button
                      variant={isSold ? "outline" : "default"}
                      className="flex-1"
                      onClick={() => navigate(`/listings/${listing.ID}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1"
                      disabled={isSold || isOwnListing}
                      onClick={() => void contactSeller(listing)}
                    >
                      {isSold ? "Sold" : isOwnListing ? "Your Listing" : "Message Seller"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoritesPage;
