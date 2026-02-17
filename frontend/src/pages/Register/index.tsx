import { useState, type ChangeEvent } from "react";
import { Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { register, type RegisterData, type RegisterResponse } from "@/api/auth";
import { toast } from "sonner";
import {
  validateEmail,
  validatePhoneNumber,
  validatePassword,
} from "@/lib/validation";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const iconModules = import.meta.glob<string>(
  "../../../public/assets/image/icon_*.png",
  {
    eager: true,
    import: "default",
  },
);

const profileIconOptions = Object.entries(iconModules)
  .map(([path, src]) => {
    const fileName = path.split("/").pop() ?? "icon_unknown.png";
    const id = fileName.replace(".png", "");
    const name = id
      .replace(/^icon_/, "")
      .split(/[_-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    return { id, name: name || id, src };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const defaultProfileIcon =
  profileIconOptions.find((option) => option.id === "icon_curious")?.src ??
  "/assets/image/icon_curious.png";

function RegisterPage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [profileIcon, setProfileIcon] = useState(defaultProfileIcon);
  const [draftProfileIcon, setDraftProfileIcon] = useState(defaultProfileIcon);
  const [isProfileIconDialogOpen, setIsProfileIconDialogOpen] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    phoneNumber?: string;
    password?: string;
  }>({});

  const handleUserNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleLocationChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };

  const handlePhoneNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleProfileIconDialogChange = (open: boolean) => {
    if (open) {
      setDraftProfileIcon(profileIcon);
    }
    setIsProfileIconDialogOpen(open);
  };

  const handleProfileIconConfirm = () => {
    setProfileIcon(draftProfileIcon);
    setIsProfileIconDialogOpen(false);
  };

  const handleCreateAccount = async () => {
    const newErrors: {
      email?: string;
      phoneNumber?: string;
      password?: string;
    } = {};

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) newErrors.phoneNumber = phoneError;

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const data: RegisterData = {
      userName: userName,
      email: email,
      location: location,
      phoneNumber: phoneNumber,
      password: password,
    };
    const response: RegisterResponse = await register(data);
    if (response.message === "Register successful") {
      toast.success("Registration successful");
      navigate("/login");
    } else {
      console.log("Register failed");
    }
  };

  const handleLogIn = () => {
    navigate("/login");
  };

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <Card className="w-full max-w-sm border-t-5 border-t-secondary rounded-md pt-0">
        <CardHeader className="relative overflow-hidden border border-primary/35 px-6 py-8">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/assets/image/header_background.png')",
            }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-background/85" aria-hidden />
          <div className="relative z-10 flex flex-col items-center justify-center">
            <CardTitle className="flex text-2xl font-bold">
              <div className="text-primary">Swamp</div>
              <div className="text-secondary">Swap</div>
            </CardTitle>
            <CardDescription>The UF International Marketplace</CardDescription>

            <Dialog
              open={isProfileIconDialogOpen}
              onOpenChange={handleProfileIconDialogChange}
            >
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="group relative mt-4 size-20 cursor-pointer overflow-hidden rounded-full border-2 border-white/90 shadow-sm"
                  aria-label="Edit profile icon"
                >
                  <img
                    src={profileIcon}
                    alt="Selected profile icon"
                    className="h-full w-full object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/45"
                    aria-hidden
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  >
                    <Pencil className="size-5" />
                  </div>
                </button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Choose a profile icon</DialogTitle>
                  <DialogDescription>
                    Select one icon first, then click confirm to apply it.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-3">
                  {profileIconOptions.map((option) => {
                    const isSelected = draftProfileIcon === option.src;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setDraftProfileIcon(option.src)}
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
                    onClick={() => setIsProfileIconDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleProfileIconConfirm}>
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="userName" className="font-bold">
                  User Name
                </Label>
                <Input
                  id="userName"
                  type="text"
                  placeholder="Albert Gator"
                  value={userName}
                  onChange={handleUserNameChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="font-bold">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="albert@gmail.com"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
                {errors.email && (
                  <p className="text-destructive text-sm">{errors.email}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location" className="font-bold">
                  Location
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Gainesville, FL"
                  value={location}
                  onChange={handleLocationChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phoneNumber" className="font-bold">
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="(352) 555-1234"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  required
                />
                {errors.phoneNumber && (
                  <p className="text-destructive text-sm">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password" className="font-bold">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
                {errors.password && (
                  <p className="text-destructive text-sm">{errors.password}</p>
                )}
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            className="w-full"
            onClick={handleCreateAccount}
          >
            Create Account
          </Button>
          <div className="flex items-center justify-center gap-2">
            <div className="text-muted-foreground text-sm">
              Already have an account?
            </div>
            <button
              type="button"
              onClick={handleLogIn}
              className="text-secondary font-bold text-sm cursor-pointer"
            >
              Log In
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default RegisterPage;
