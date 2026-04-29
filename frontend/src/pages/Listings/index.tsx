import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Heart, Search } from "lucide-react";

import { getCurrentUser, logout, type CurrentUser } from "@/api/auth";
import {
  createListing,
  defaultListingSort,
  defaultListingStatus,
  isAuthenticated,
  listListings,
} from "@/api/listings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu-style";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFavoriteListings } from "@/hooks/useFavoriteListings";
import { cn } from "@/lib/utils";
import { getListingImageSrc } from "@/lib/listing-images";
import { toast } from "sonner";
import { listingCategories, listingConditions } from "@/types/listing";
import type {
  CreateListingData,
  Listing,
  ListingCategory,
  ListingCondition,
  ListingFilterStatus,
  ListingSort,
} from "@/types/listing";

const sortOptions: Array<{ label: string; value: ListingSort }> = [
  { label: "Newest first", value: "latest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Price low to high", value: "price_asc" },
  { label: "Price high to low", value: "price_desc" },
];

const statusOptions: Array<{ label: string; value: ListingFilterStatus }> = [
  { label: "All items", value: "all" },
  { label: "Available only", value: "available" },
  { label: "Sold only", value: "sold" },
];

const renderAvatar = (
  avatar: string | undefined,
  label: string,
  fallbackText: string,
  className: string,
) =>
  avatar ? (
    <img src={avatar} alt={label} className={className} />
  ) : (
    <div
      aria-label={label}
      className={cn(
        className,
        "flex items-center justify-center bg-primary/10 text-sm font-semibold text-primary",
      )}
    >
      {fallbackText}
    </div>
  );

function ListingsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSellOpen, setIsSellOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellForm, setSellForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    images: [] as File[],
  });
  const { isFavorite, toggleFavorite } = useFavoriteListings();

  const search = searchParams.get("search") ?? "";
  const sort = (searchParams.get("sort") as ListingSort | null) ?? defaultListingSort;
  const status =
    (searchParams.get("status") as ListingFilterStatus | null) ??
    defaultListingStatus;
  const categoryFilter =
    (searchParams.get("category") as ListingCategory | null) ?? null;
  const activeCategory = listingCategories.find(
    (category) => category === categoryFilter,
  );

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listListings({ search, sort, status, category: categoryFilter ?? undefined });
        setListings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load listings");
      } finally {
        setLoading(false);
      }
    };

    void fetchListings();
  }, [search, sort, status, categoryFilter]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
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

    void fetchCurrentUser();
  }, []);

  const updateFilters = (next: {
    search?: string;
    sort?: ListingSort;
    status?: ListingFilterStatus;
    category?: ListingCategory | null;
  }) => {
    const params = new URLSearchParams(searchParams);

    const nextSearch = next.search ?? search;
    const nextSort = next.sort ?? sort;
    const nextStatus = next.status ?? status;
    const nextCategory =
      next.category === undefined ? categoryFilter : next.category;

    if (nextSearch.trim()) {
      params.set("search", nextSearch.trim());
    } else {
      params.delete("search");
    }

    if (nextSort !== defaultListingSort) {
      params.set("sort", nextSort);
    } else {
      params.delete("sort");
    }

    if (nextStatus !== defaultListingStatus) {
      params.set("status", nextStatus);
    } else {
      params.delete("status");
    }

    if (nextCategory) {
      params.set("category", nextCategory);
    } else {
      params.delete("category");
    }

    setSearchParams(params);
  };

  const resetFilters = () => {
    setSearchParams({});
  };

  const openSellerChat = (listing: Listing) => {
    const draft = `Hi ${listing.seller_name || ""}, I'm interested in your listing "${listing.title}". Is it still available?`;
    const params = new URLSearchParams({
      userId: String(listing.user_id),
      listingTitle: listing.title,
      draft,
    });
    navigate(`/chat?${params.toString()}`);
  };

  const resolveCurrentUser = async () => {
    if (currentUser) {
      return currentUser;
    }

    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      return user;
    } catch {
      return null;
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setIsUserMenuOpen(false);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleSellSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAuthenticated()) {
      toast.error("Please log in before posting an item.");
      navigate("/login");
      return;
    }

    const price = Number.parseFloat(sellForm.price);
    if (
      !sellForm.title.trim() ||
      !sellForm.description.trim() ||
      !sellForm.category ||
      !sellForm.condition.trim() ||
      Number.isNaN(price)
    ) {
      toast.error("Please complete the title, category, condition, description, and price fields.");
      return;
    }

    if (price <= 0) {
      toast.error("Price must be greater than 0.");
      return;
    }

    const payload: CreateListingData = {
      title: sellForm.title.trim(),
      description: sellForm.description.trim(),
      price,
      category: sellForm.category as ListingCategory,
      condition: sellForm.condition as ListingCondition,
    };
    if (sellForm.images.length > 0) {
      payload.images = sellForm.images;
    }

    try {
      setIsSubmitting(true);
      const createdListing = await createListing(payload);
      setListings((current) => [createdListing, ...current]);
      setSellForm({
        title: "",
        description: "",
        price: "",
        category: "",
        condition: "",
        images: [],
      });
      setIsSellOpen(false);
      toast.success("Your item is now live.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);

  const filteredListings = listings
    .filter((listing) => {
      if (status !== "all" && listing.status !== status) {
        return false;
      }

      if (activeCategory && listing.category !== activeCategory) {
        return false;
      }

      if (!search.trim()) {
        return true;
      }

      const normalizedSearch = search.trim().toLowerCase();

      return (
        listing.title.toLowerCase().includes(normalizedSearch) ||
        listing.description.toLowerCase().includes(normalizedSearch)
      );
    })
    .sort((left, right) => {
      if (sort === "price_asc") {
        return left.price - right.price;
      }

      if (sort === "price_desc") {
        return right.price - left.price;
      }

      if (sort === "oldest") {
        return left.CreatedAt.localeCompare(right.CreatedAt);
      }

      return right.CreatedAt.localeCompare(left.CreatedAt);
    });

  return (
    <div className="h-full bg-[linear-gradient(180deg,rgba(0,82,255,0.08),transparent_28%),linear-gradient(135deg,rgba(255,125,0,0.08),transparent_48%),var(--background)]">
      <div className="sticky top-0 z-30 border-b border-primary/10 bg-background">
        <nav className="w-full px-6 md:px-8">
          <div className="bg-card">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
              <div>
                <div className="text-2xl font-semibold tracking-tight">SwampSwap Market</div>
                <p className="text-base text-muted-foreground">
                  Campus second-hand listings
                </p>
              </div>

              <NavigationMenu viewport={false} className="max-w-full justify-start">
                <NavigationMenuList className="flex-wrap justify-start gap-2">
                  <NavigationMenuItem>
                    <Link
                      to="/"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "h-10 bg-transparent px-5 text-base text-muted-foreground",
                      )}
                    >
                      Home
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <button
                      type="button"
                      onClick={() => updateFilters({ category: null })}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "h-10 px-5 text-base",
                        !activeCategory
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                          : "bg-transparent text-muted-foreground",
                      )}
                    >
                      All
                    </button>
                  </NavigationMenuItem>
                  {listingCategories.map((category) => {
                    const isActive = activeCategory === category;

                    return (
                      <NavigationMenuItem key={category}>
                        <button
                          type="button"
                          onClick={() =>
                            updateFilters({
                              category: isActive ? null : category,
                            })
                          }
                          className={cn(
                            navigationMenuTriggerStyle(),
                            "h-10 px-5 text-base",
                            isActive
                              ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                              : "bg-transparent text-muted-foreground",
                          )}
                        >
                          {category}
                        </button>
                      </NavigationMenuItem>
                    );
                  })}
                  {search && !activeCategory && (
                    <NavigationMenuItem>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "h-10 bg-primary px-5 text-base text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                        )}
                      >
                        {search}
                      </button>
                    </NavigationMenuItem>
                  )}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              {currentUser ? (
                <div className="relative">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={isUserMenuOpen}
                    aria-label="Open user menu"
                    onClick={() => setIsUserMenuOpen((isOpen) => !isOpen)}
                    className="flex items-center gap-3 rounded-2xl bg-background px-3 py-2 text-left transition hover:bg-accent"
                  >
                    {renderAvatar(
                      currentUser.avatar,
                      currentUser.username,
                      currentUser.username.trim().charAt(0).toUpperCase() || "U",
                      "size-10 rounded-full border border-primary/10 bg-muted object-cover",
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold">
                        {currentUser.username}
                      </p>
                    </div>
                  </button>
                  {isUserMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-52 rounded-lg border bg-card p-2 shadow-lg"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        className="w-full rounded-md px-3 py-2 text-left text-sm transition hover:bg-accent"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate("/favorites");
                        }}
                      >
                        Saved Listings
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="w-full rounded-md px-3 py-2 text-left text-sm transition hover:bg-accent"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate("/user-info");
                        }}
                      >
                        View Profile
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="w-full rounded-md px-3 py-2 text-left text-sm text-destructive transition hover:bg-destructive/10"
                        onClick={handleLogout}
                      >
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button variant="outline" onClick={() => navigate("/login")}>
                  Log In
                </Button>
              )}

              <div className="flex flex-wrap gap-2">
                <Dialog open={isSellOpen} onOpenChange={setIsSellOpen}>
                  <DialogTrigger asChild>
                    <Button>Sell an Item</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Post a new listing</DialogTitle>
                      <DialogDescription>
                        Share the basics and we will add it to the marketplace.
                      </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={handleSellSubmit}>
                      <div className="space-y-2">
                        <Label htmlFor="sell-title">Item title</Label>
                        <Input
                          id="sell-title"
                          value={sellForm.title}
                          onChange={(event) =>
                            setSellForm((current) => ({
                              ...current,
                              title: event.target.value,
                            }))
                          }
                          placeholder="Desk lamp, bike lock, calculus textbook..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sell-category">Category</Label>
                        <Select
                          id="sell-category"
                          value={sellForm.category}
                          onChange={(event) =>
                            setSellForm((current) => ({
                              ...current,
                              category: event.target.value,
                            }))
                          }
                        >
                          <option value="">Select a category</option>
                          {listingCategories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sell-description">Description</Label>
                        <Textarea
                          id="sell-description"
                          value={sellForm.description}
                          onChange={(event) =>
                            setSellForm((current) => ({
                              ...current,
                              description: event.target.value,
                            }))
                          }
                          placeholder="Pickup spot, included accessories, and anything the buyer should know."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sell-condition">Condition</Label>
                        <Select
                          id="sell-condition"
                          value={sellForm.condition}
                          onChange={(event) =>
                            setSellForm((current) => ({
                              ...current,
                              condition: event.target.value,
                            }))
                          }
                        >
                          <option value="">Select item condition</option>
                          {listingConditions.map((condition) => (
                            <option key={condition} value={condition}>
                              {condition}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sell-price">Price (USD)</Label>
                        <Input
                          id="sell-price"
                          type="number"
                          min="1"
                          step="1"
                          value={sellForm.price}
                          onChange={(event) =>
                            setSellForm((current) => ({
                              ...current,
                              price: event.target.value,
                            }))
                          }
                          placeholder="25"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sell-images">Photos</Label>
                        <Input
                          id="sell-images"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(event) =>
                            setSellForm((current) => ({
                              ...current,
                              images: Array.from(event.target.files ?? []),
                            }))
                          }
                        />
                        {sellForm.images.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {sellForm.images.length} photo
                            {sellForm.images.length === 1 ? "" : "s"} selected
                          </p>
                        )}
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Posting..." : "Post Listing"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
          </div>
        </nav>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8">

        <section className="space-y-6">
          <Card className="border-primary/10">
            <CardContent className="flex flex-col gap-2  lg:flex-row lg:items-end">
             

              <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.8fr)_minmax(180px,0.8fr)_minmax(180px,0.8fr)_auto]">
                  <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                      id="listing-search"
                      className="h-8 pl-9 text-sm"
                      value={search}
                      onChange={(event) => updateFilters({ search: event.target.value })}
                      placeholder="Search by title or description"
                    />
                  </div>
                  <Select
                    id="listing-sort"
                    className="h-8 text-sm"
                    value={sort}
                    onChange={(event) =>
                      updateFilters({ sort: event.target.value as ListingSort })
                    }
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>


                  <Select
                    id="listing-status"
                    className="h-8 text-sm"
                    value={status}
                    onChange={(event) =>
                      updateFilters({
                        status: event.target.value as ListingFilterStatus,
                      })
                    }
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={resetFilters}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  Loading marketplace listings...
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="space-y-4 py-10 text-center">
                  <p className="text-destructive">{error}</p>
                  <Button onClick={() => updateFilters({})}>Try again</Button>
                </CardContent>
              </Card>
            ) : filteredListings.length === 0 ? (
              <Card>
                <CardContent className="space-y-3 py-12 text-center">
                  <p className="text-lg font-medium">No items match these filters.</p>
                  <p className="text-muted-foreground">
                    Try broadening your search or be the first person to post one.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredListings.map((listing) => {
                  const isSold = listing.status === "sold";
                  const sellerName = listing.seller_name || `User #${listing.user_id}`;
                  const sellerInitial = sellerName.trim().charAt(0).toUpperCase() || "U";
                  const isOwnListing = currentUser?.id === listing.user_id;
                  const isSaved = isFavorite(listing.ID);

                  return (
                    <Card
                      key={listing.ID}
                      className="group border-primary/10 transition-transform duration-200 hover:-translate-y-1"
                    >
                      <CardHeader className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            {renderAvatar(
                              listing.seller_avatar,
                              sellerName,
                              sellerInitial,
                              "size-12 rounded-full border border-primary/10 bg-muted object-cover",
                            )}
                            <div className="min-w-0">
                              <CardDescription className="truncate">
                                Sold by {sellerName}
                              </CardDescription>
                              <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                {listing.category}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Button
                              type="button"
                              variant={isSaved ? "secondary" : "outline"}
                              size="icon-sm"
                              aria-label={
                                isSaved
                                  ? `Remove ${listing.title} from saved listings`
                                  : `Save ${listing.title}`
                              }
                              title={
                                isSaved
                                  ? "Remove from saved listings"
                                  : "Save listing"
                              }
                              onClick={() => toggleFavorite(listing.ID)}
                            >
                              <Heart
                                className={cn("size-4", isSaved && "fill-current")}
                              />
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
                      <CardContent className="space-y-3 pt-0">
                        <div className="overflow-hidden rounded-[1.5rem] border border-primary/10 bg-background">
                          <img
                            src={getListingImageSrc(listing)}
                            alt={listing.title}
                            className="h-44 w-full object-contain p-3 transition duration-300 group-hover:scale-[1.02]"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            Condition: {listing.condition}
                          </span>
                        </div>
                        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                          {listing.description}
                        </p>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between gap-3">
                        <Link to={`/listings/${listing.ID}`} className="flex-1">
                          <Button className="w-full" variant={isSold ? "outline" : "default"}>
                            View Details
                          </Button>
                        </Link>
                        {!isSold && (
                          <Button
                            variant="secondary"
                            disabled={isOwnListing}
                            onClick={async () => {
                              if (!isAuthenticated()) {
                                toast.error("Please log in before buying an item.");
                                navigate("/login");
                                return;
                              }

                              const activeUser = await resolveCurrentUser();

                              if (activeUser?.id === listing.user_id) {
                                toast.error("You cannot buy your own listing.");
                                return;
                              }

                              openSellerChat(listing);
                            }}
                          >
                            {isOwnListing ? "Your Listing" : "Buy"}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ListingsPage;
