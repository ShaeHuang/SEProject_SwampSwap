import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";

import { getCurrentUser, type CurrentUser } from "@/api/auth";
import {
  buyListing,
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
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type {
  CreateListingData,
  Listing,
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

const categoryOptions = [
  "Digital Product",
  "Furniture",
  "Cooking",
  "Clothing",
  "Sports",
  "Cars",
] as const;

const getSellerAvatar = (sellerName: string, sellerId: number) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
    sellerName || `user-${sellerId}`,
  )}`;

const getListingImage = (title: string, price: number) => {
  const palette = [
    ["#0f4c81", "#4f83ff"],
    ["#c65d00", "#ffb347"],
    ["#12664f", "#52b788"],
    ["#5a189a", "#9d4edd"],
  ];
  const seed = title
    .split("")
    .reduce((total, character) => total + character.charCodeAt(0), 0);
  const [startColor, endColor] = palette[seed % palette.length];
  const initials = title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("") || "SS";
  const safeTitle = title.slice(0, 28);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${startColor}" />
          <stop offset="100%" stop-color="${endColor}" />
        </linearGradient>
      </defs>
      <rect width="640" height="400" rx="36" fill="url(#g)" />
      <circle cx="540" cy="86" r="86" fill="rgba(255,255,255,0.14)" />
      <circle cx="126" cy="338" r="112" fill="rgba(255,255,255,0.1)" />
      <text x="68" y="168" fill="white" font-family="Arial, sans-serif" font-size="88" font-weight="700">${initials}</text>
      <text x="68" y="248" fill="rgba(255,255,255,0.92)" font-family="Arial, sans-serif" font-size="34" font-weight="600">${safeTitle}</text>
      <text x="68" y="302" fill="rgba(255,255,255,0.78)" font-family="Arial, sans-serif" font-size="24">SwampSwap Listing</text>
      <text x="68" y="352" fill="white" font-family="Arial, sans-serif" font-size="28" font-weight="700">$${price}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

function ListingsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSellOpen, setIsSellOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellForm, setSellForm] = useState({
    title: "",
    description: "",
    price: "",
  });

  const search = searchParams.get("search") ?? "";
  const sort = (searchParams.get("sort") as ListingSort | null) ?? defaultListingSort;
  const status =
    (searchParams.get("status") as ListingFilterStatus | null) ??
    defaultListingStatus;
  const activeCategory = categoryOptions.find(
    (category) => category.toLowerCase() === search.toLowerCase(),
  );

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listListings({ search, sort, status });
        setListings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load listings");
      } finally {
        setLoading(false);
      }
    };

    void fetchListings();
  }, [search, sort, status]);

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
  }) => {
    const params = new URLSearchParams(searchParams);

    const nextSearch = next.search ?? search;
    const nextSort = next.sort ?? sort;
    const nextStatus = next.status ?? status;

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

    setSearchParams(params);
  };

  const resetFilters = () => {
    setSearchParams({});
  };

  const handleSellSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAuthenticated()) {
      toast.error("Please log in before posting an item.");
      navigate("/login");
      return;
    }

    const price = Number.parseFloat(sellForm.price);
    if (!sellForm.title.trim() || !sellForm.description.trim() || Number.isNaN(price)) {
      toast.error("Please complete the title, description, and price fields.");
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
    };

    try {
      setIsSubmitting(true);
      const createdListing = await createListing(payload);
      setListings((current) => [createdListing, ...current]);
      setSellForm({ title: "", description: "", price: "" });
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
                  {categoryOptions.map((category) => {
                    const isActive = activeCategory === category;

                    return (
                      <NavigationMenuItem key={category}>
                        <button
                          type="button"
                          onClick={() => updateFilters({ search: category })}
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
                <button
                  type="button"
                  onClick={() => navigate("/user-info")}
                  className="flex items-center gap-3 rounded-2xl bg-background px-3 py-2 text-left transition hover:bg-accent"
                >
                  <img
                    src={getSellerAvatar(currentUser.username, currentUser.id)}
                    alt={currentUser.username}
                    className="size-10 rounded-full border border-primary/10 bg-muted object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold">
                      {currentUser.username}
                    </p>
                  </div>
                </button>
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
                          placeholder="Condition, pickup spot, and anything the buyer should know."
                        />
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
            ) : listings.length === 0 ? (
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
                {listings.map((listing) => {
                  const isSold = listing.status === "sold";
                  const sellerName = `User #${listing.user_id}`;

                  return (
                    <Card
                      key={listing.ID}
                      className="group border-primary/10 transition-transform duration-200 hover:-translate-y-1"
                    >
                      <CardHeader className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <img
                              src={getSellerAvatar(sellerName, listing.user_id)}
                              alt={sellerName}
                              className="size-12 rounded-full border border-primary/10 bg-muted object-cover"
                            />
                            <div className="min-w-0">
                              <CardDescription className="truncate">
                                Sold by {sellerName}
                              </CardDescription>
                            </div>
                          </div>
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
                        <div className="text-3xl font-semibold text-primary">
                          {formatPrice(listing.price)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        <div className="overflow-hidden rounded-[1.5rem] border border-primary/10 bg-muted/50">
                          <img
                            src={getListingImage(listing.title, listing.price)}
                            alt={listing.title}
                            className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                          />
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
                            onClick={async () => {
                              if (!isAuthenticated()) {
                                toast.error("Please log in before buying an item.");
                                navigate("/login");
                                return;
                              }

                              try {
                                const updated = await buyListing(listing.ID);
                                setListings((current) =>
                                  current.map((item) =>
                                    item.ID === listing.ID ? updated : item,
                                  ),
                                );
                                toast.success("Purchase confirmed.");
                              } catch (err) {
                                toast.error(
                                  err instanceof Error
                                    ? err.message
                                    : "Unable to buy this item",
                                );
                              }
                            }}
                          >
                            Buy
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
