import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heart } from "lucide-react";

import { getCurrentUser, type CurrentUser } from "@/api/auth";
import { getListingById, isAuthenticated } from "@/api/listings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getListingImageSrc, getListingPrimaryImage } from "@/lib/listing-images";
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import { toast } from "sonner";
import type { Listing } from "@/types/listing";

function ListingDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isFavorite, toggleFavorite } = useFavoriteListings();

  useEffect(() => {
    if (!id) {
      setError("Listing not found.");
      setLoading(false);
      return;
    }

    const fetchListing = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getListingById(id);
        setListing(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load listing");
      } finally {
        setLoading(false);
      }
    };

    void fetchListing();
  }, [id]);

  useEffect(() => {
    const loadCurrentUser = async () => {
      if (!isAuthenticated()) {
        setCurrentUser(null);
        return;
      }

      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
      }
    };

    void loadCurrentUser();
  }, []);

  const formattedPrice = useMemo(() => {
    if (!listing) {
      return "";
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(listing.price);
  }, [listing]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading listing details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>We couldn&apos;t load that item</CardTitle>
            <CardDescription>{error ?? "Listing not found."}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/listings")}>Back to marketplace</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isSold = listing.status === "sold";
  const sellerName = listing.seller_name || `User #${listing.user_id}`;
  const sellerInitial = sellerName.trim().charAt(0).toUpperCase() || "U";
  const isOwnListing = currentUser?.id === listing.user_id;
  const primaryImage = getListingPrimaryImage(listing);
  const isSaved = isFavorite(listing.ID);

  const handleBuy = async () => {
    if (!isAuthenticated()) {
      toast.error("Please log in before buying an item.");
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
      toast.error("You cannot buy your own listing.");
      return;
    }

    const params = new URLSearchParams({
      userId: String(listing.user_id),
      listingTitle: listing.title,
      draft: `Hi ${sellerName}, I'm interested in your listing "${listing.title}". Is it still available?`,
    });
    navigate(`/chat?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,125,0,0.12),transparent_28%),linear-gradient(180deg,rgba(0,82,255,0.08),transparent_35%),var(--background)] px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => navigate("/listings")}>
            Back to marketplace
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={isSaved ? "secondary" : "outline"}
              onClick={() => toggleFavorite(listing.ID)}
              aria-label={
                isSaved
                  ? `Remove ${listing.title} from saved listings`
                  : `Save ${listing.title}`
              }
            >
              <Heart className={`size-4 ${isSaved ? "fill-current" : ""}`} />
              {isSaved ? "Saved" : "Save"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Home
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <Card className="border-primary/10">
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-3xl">{listing.title}</CardTitle>
                  <CardDescription>
                    Sold by {sellerName}
                  </CardDescription>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    {listing.category}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    isSold ? "bg-muted text-muted-foreground" : "bg-secondary/15 text-secondary"
                  }`}
                >
                  {isSold ? "Sold" : "Available"}
                </span>
              </div>
              <div className="text-4xl font-semibold text-primary">{formattedPrice}</div>
            </CardHeader>
            <CardContent className="space-y-6">
              <section className="space-y-3">
                <div className="overflow-hidden rounded-2xl border border-primary/10 bg-muted/50">
                  <img
                    src={getListingImageSrc(listing)}
                    alt={listing.title}
                    className="h-80 w-full object-cover"
                  />
                </div>
                {listing.imageUrls && listing.imageUrls.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {listing.imageUrls.slice(0, 4).map((imageUrl, index) => (
                      <img
                        key={imageUrl}
                        src={imageUrl}
                        alt={`${listing.title} ${index + 1}`}
                        className={`h-20 w-full rounded-lg border object-cover ${
                          imageUrl === primaryImage
                            ? "border-primary"
                            : "border-primary/10"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-semibold">About this item</h2>
                <p className="leading-7 text-muted-foreground">{listing.description}</p>
              </section>

              <section className="grid gap-4 rounded-2xl bg-muted/40 p-5 sm:grid-cols-2">
                <div className="sm:col-span-2 flex items-center gap-3 rounded-2xl bg-background/80 p-4">
                  {listing.seller_avatar ? (
                    <img
                      src={listing.seller_avatar}
                      alt={sellerName}
                      className="size-12 rounded-full border border-primary/10 object-cover"
                    />
                  ) : (
                    <div className="flex size-12 items-center justify-center rounded-full border border-primary/10 bg-primary/10 text-sm font-semibold text-primary">
                      {sellerInitial}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">Seller</p>
                    <p className="text-sm text-muted-foreground">{sellerName}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Listing ID</p>
                  <p className="text-sm text-muted-foreground">#{listing.ID}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Seller</p>
                  <p className="text-sm text-muted-foreground">{sellerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-sm text-muted-foreground">{listing.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Condition</p>
                  <p className="text-sm text-muted-foreground">{listing.condition}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Posted</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(listing.CreatedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Availability</p>
                  <p className="text-sm text-muted-foreground">
                    {isSold ? "This item is no longer available." : "Ready to purchase."}
                  </p>
                </div>
              </section>
            </CardContent>
          </Card>

          <Card className="h-fit border-secondary/20 bg-card/95">
            <CardHeader>
              <CardTitle>Next step</CardTitle>
              <CardDescription>
                Review the item and complete your action here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Buy opens Messages with the seller so you can coordinate directly. If
                you are not logged in, we will send you to the login page first.
              </p>
              {isSold && (
                <p>This listing has already been purchased and can no longer be bought.</p>
              )}
              {isOwnListing && (
                <p>This is your listing, so it cannot be bought from your own account.</p>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button
                className="w-full"
                disabled={isSold || isOwnListing}
                onClick={handleBuy}
              >
                {isSold ? "Item Sold" : isOwnListing ? "Your Listing" : "Buy Now"}
              </Button>
              <Button className="w-full" variant="outline" onClick={() => navigate("/listings")}>
                Keep Browsing
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ListingDetailPage;
