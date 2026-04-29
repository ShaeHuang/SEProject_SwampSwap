import { useEffect, useRef, useState } from "react";
import { Check, Pencil, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  logout,
} from "@/api/auth";
import {
  createListing,
  deleteListing,
  isAuthenticated,
  updateListing,
} from "@/api/listings";
import {
  getCurrentUserListings,
  getCurrentUserProfile,
  uploadCurrentUserAvatar,
  updateCurrentUserProfile,
} from "@/api/user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getListingImageSrc } from "@/lib/listing-images";
import { defaultProfileIcon, profileIconOptions } from "@/lib/profile-icons";
import { listingCategories, listingConditions } from "@/types/listing";
import type { CreateListingData, Listing } from "@/types/listing";
import type { CurrentUserProfile } from "@/types/user";
import { toast } from "sonner";

type EditFormState = {
  title: string;
  description: string;
  price: string;
  category: string;
  condition: string;
  images: File[];
};

const createEditForm = (listing: Listing): EditFormState => ({
  title: listing.title,
  description: listing.description,
  price: String(listing.price),
  category: listing.category,
  condition: listing.condition,
  images: [],
});

function UserPage() {
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    images: [] as File[],
  });
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [draftAvatar, setDraftAvatar] = useState(defaultProfileIcon);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    const fetchPageData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [currentProfile, currentListings] = await Promise.all([
          getCurrentUserProfile(),
          getCurrentUserListings(),
        ]);

        setProfile(currentProfile);
        setListings(currentListings);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    void fetchPageData();
  }, [navigate]);

  const formatDate = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);

  const openEditDialog = (listing: Listing) => {
    setEditingListing(listing);
    setEditForm(createEditForm(listing));
  };

  const closeEditDialog = () => {
    setEditingListing(null);
    setEditForm(null);
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingListing || !editForm) {
      return;
    }

    const price = Number.parseFloat(editForm.price);

    if (
      !editForm.title.trim() ||
      !editForm.description.trim() ||
      !editForm.category ||
      !editForm.condition ||
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
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      price,
      category: editForm.category as CreateListingData["category"],
      condition: editForm.condition as CreateListingData["condition"],
    };
    if (editForm.images.length > 0) {
      payload.images = editForm.images;
    }

    try {
      setIsSaving(true);
      const updated = await updateListing(editingListing.ID, payload);
      setListings((current) =>
        current.map((listing) => (listing.ID === updated.ID ? updated : listing)),
      );
      closeEditDialog();
      toast.success("Listing updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update listing.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (listing: Listing) => {
    if (!window.confirm(`Delete "${listing.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(listing.ID);
      await deleteListing(listing.ID);
      setListings((current) => current.filter((item) => item.ID !== listing.ID));
      toast.success("Listing deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete listing.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAuthenticated()) {
      toast.error("Please log in before posting an item.");
      navigate("/login");
      return;
    }

    const price = Number.parseFloat(createForm.price);
    if (
      !createForm.title.trim() ||
      !createForm.description.trim() ||
      !createForm.category ||
      !createForm.condition.trim() ||
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
      title: createForm.title.trim(),
      description: createForm.description.trim(),
      price,
      category: createForm.category as CreateListingData["category"],
      condition: createForm.condition as CreateListingData["condition"],
    };
    if (createForm.images.length > 0) {
      payload.images = createForm.images;
    }

    try {
      setIsSubmitting(true);
      const createdListing = await createListing(payload);
      setListings((current) => [createdListing, ...current]);
      setCreateForm({
        title: "",
        description: "",
        price: "",
        category: "",
        condition: "",
        images: [],
      });
      setIsCreateOpen(false);
      toast.success("Your item is now live.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openProfileDialog = () => {
    setDraftAvatar(profile?.avatar || defaultProfileIcon);
    setIsProfileDialogOpen(true);
  };

  const handleProfileSave = async () => {
    if (!profile) {
      return;
    }

    try {
      setIsProfileSaving(true);
      const updatedProfile = await updateCurrentUserProfile({ avatar: draftAvatar });
      setProfile(updatedProfile);
      setIsProfileDialogOpen(false);
      toast.success("Profile photo updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile photo.");
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !profile) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }

    try {
      setIsAvatarUploading(true);
      const uploadedAvatarUrl = await uploadCurrentUserAvatar(file);
      const updatedProfile = await updateCurrentUserProfile({ avatar: uploadedAvatarUrl });
      setProfile(updatedProfile);
      setDraftAvatar(updatedProfile.avatar || uploadedAvatarUrl);
      setIsProfileDialogOpen(false);
      toast.success("Profile photo uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload profile photo.");
    } finally {
      setIsAvatarUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading your account...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>We couldn&apos;t load your profile</CardTitle>
            <CardDescription>{error ?? "Please try again later."}</CardDescription>
          </CardHeader>
          <CardFooter className="gap-3">
            <Button variant="outline" onClick={() => navigate("/")}>
              Back Home
            </Button>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const itemsSold = listings.filter((listing) => listing.status === "sold").length;
  const avatarInitial = profile.username.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,125,0,0.12),transparent_28%),linear-gradient(180deg,rgba(0,82,255,0.08),transparent_35%),var(--background)] px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Back
          </Button>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={openProfileDialog}>
              Edit Profile
            </Button>
            <Button variant="outline" onClick={() => navigate("/listings")}>
              Go to Marketplace
            </Button>
            <Button variant="outline" onClick={() => navigate("/favorites")}>
              Saved Listings
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Log Out
            </Button>
          </div>
        </div>

        <Card className="border-primary/10">
          <CardContent className="flex flex-col gap-6 p-8 sm:flex-row sm:items-start">
            <div className="flex shrink-0 justify-center">
              {profile.avatar ? (
                <button
                  type="button"
                  className="group relative cursor-pointer"
                  onClick={openProfileDialog}
                  aria-label="Edit profile photo"
                >
                  <img
                    src={profile.avatar}
                    alt={profile.username}
                    className="size-32 rounded-full border-4 border-primary/10 object-cover"
                  />
                  <span
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100"
                    aria-hidden
                  >
                    <Pencil className="size-5" />
                  </span>
                </button>
              ) : (
                <div className="flex size-32 items-center justify-center rounded-full border-4 border-primary/10 bg-primary/10 text-4xl font-bold text-primary">
                  {avatarInitial}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{profile.username}</h1>
                <p className="text-muted-foreground">Joined {formatDate(profile.joinedAt)}</p>
              </div>

              {profile.bio && <p className="text-muted-foreground">{profile.bio}</p>}

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-muted/40 p-4">
                  <p className="text-2xl font-bold text-primary">{listings.length}</p>
                  <p className="text-sm text-muted-foreground">Items Posted</p>
                </div>
                <div className="rounded-2xl bg-muted/40 p-4">
                  <p className="text-2xl font-bold text-primary">{itemsSold}</p>
                  <p className="text-sm text-muted-foreground">Items Sold</p>
                </div>
                <div className="rounded-2xl bg-muted/40 p-4">
                  <p className="truncate text-base font-semibold text-foreground">
                    {profile.email || "No email added"}
                  </p>
                  <p className="text-sm text-muted-foreground">Contact Email</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Your Listings</h2>
              <p className="text-muted-foreground">
                Manage the items you have posted to the marketplace.
              </p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>Post an Item</Button>
          </div>

          {listings.length === 0 ? (
            <Card>
              <CardContent className="space-y-3 py-12 text-center">
                <p className="text-lg font-medium">You have not posted any items yet.</p>
                <p className="text-muted-foreground">
                  Head to the marketplace to create your first listing.
                </p>
                <div className="flex justify-center">
                  <Button onClick={() => setIsCreateOpen(true)}>Post an Item</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {listings.map((listing) => {
                const isSold = listing.status === "sold";

                return (
                  <Card key={listing.ID} className="border-primary/10">
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <CardTitle className="truncate text-xl">{listing.title}</CardTitle>
                          <CardDescription>
                            Posted {formatDate(listing.CreatedAt)}
                          </CardDescription>
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
                    <CardContent className="space-y-3">
                      <div className="overflow-hidden rounded-2xl border border-primary/10 bg-background">
                        <img
                          src={getListingImageSrc(listing)}
                          alt={listing.title}
                          className="h-40 w-full object-contain p-3"
                        />
                      </div>
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
                    <CardFooter className="gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => openEditDialog(listing)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        disabled={deletingId === listing.ID}
                        onClick={() => void handleDelete(listing)}
                      >
                        {deletingId === listing.ID ? "Deleting..." : "Delete"}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <Dialog open={Boolean(editingListing)} onOpenChange={(open) => !open && closeEditDialog()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit listing</DialogTitle>
              <DialogDescription>
                Update your item details and save the changes to the marketplace.
              </DialogDescription>
            </DialogHeader>

            {editForm && (
              <form className="space-y-4" onSubmit={handleEditSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editForm.title}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              title: event.target.value,
                            }
                          : current,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    id="edit-category"
                    value={editForm.category}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              category: event.target.value,
                            }
                          : current,
                      )
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
                  <Label htmlFor="edit-condition">Condition</Label>
                  <Select
                    id="edit-condition"
                    value={editForm.condition}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              condition: event.target.value,
                            }
                          : current,
                      )
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
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editForm.description}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              description: event.target.value,
                            }
                          : current,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price (USD)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="1"
                    step="1"
                    value={editForm.price}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              price: event.target.value,
                            }
                          : current,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-images">Replace photos</Label>
                  <Input
                    id="edit-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              images: Array.from(event.target.files ?? []),
                            }
                          : current,
                      )
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    {editForm.images.length > 0
                      ? `${editForm.images.length} photo${editForm.images.length === 1 ? "" : "s"} selected`
                      : "Leave empty to keep the current photos."}
                  </p>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={closeEditDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Post a new listing</DialogTitle>
              <DialogDescription>
                Share the basics and we will add it to the marketplace.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleCreateSubmit}>
              <div className="space-y-2">
                <Label htmlFor="sell-title">Item title</Label>
                <Input
                  id="sell-title"
                  value={createForm.title}
                  onChange={(event) =>
                    setCreateForm((current) => ({
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
                  value={createForm.category}
                  onChange={(event) =>
                    setCreateForm((current) => ({
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
                  value={createForm.description}
                  onChange={(event) =>
                    setCreateForm((current) => ({
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
                  value={createForm.condition}
                  onChange={(event) =>
                    setCreateForm((current) => ({
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
                  value={createForm.price}
                  onChange={(event) =>
                    setCreateForm((current) => ({
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
                    setCreateForm((current) => ({
                      ...current,
                      images: Array.from(event.target.files ?? []),
                    }))
                  }
                />
                {createForm.images.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {createForm.images.length} photo
                    {createForm.images.length === 1 ? "" : "s"} selected
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Posting..." : "Post Listing"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Choose a profile icon</DialogTitle>
              <DialogDescription>
                Select a preset icon, or upload a photo from your device.
              </DialogDescription>
            </DialogHeader>

            <input
              ref={avatarFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />

            <Button
              type="button"
              variant="outline"
              disabled={isAvatarUploading}
              onClick={() => avatarFileInputRef.current?.click()}
            >
              <Upload className="size-4" />
              {isAvatarUploading ? "Uploading..." : "Upload from Device"}
            </Button>

            <div className="grid grid-cols-3 gap-3">
              {profileIconOptions.map((option) => {
                const isSelected = draftAvatar === option.src;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setDraftAvatar(option.src)}
                    className={cn(
                      "group/icon relative overflow-hidden rounded-xl border border-border transition-all",
                      "hover:ring-2 hover:ring-primary/50 focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:outline-none",
                      isSelected && "ring-2 ring-primary",
                    )}
                    aria-label={`Select ${option.name} icon`}
                  >
                    <img
                      src={option.src}
                      alt={`${option.name} icon`}
                      className="h-20 w-full object-cover"
                    />
                    <div
                      className={cn(
                        "absolute inset-0 bg-black/0 transition-colors group-hover/icon:bg-black/30",
                        isSelected && "bg-black/35",
                      )}
                      aria-hidden
                    />
                    {isSelected && (
                      <div
                        className="absolute inset-0 flex items-center justify-center text-white"
                        aria-hidden
                      >
                        <Check className="size-6" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsProfileDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleProfileSave} disabled={isProfileSaving}>
                {isProfileSaving ? "Saving..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default UserPage;
