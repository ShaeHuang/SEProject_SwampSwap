import { useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function RegisterPage() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

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

  const handleCreateAccount = () => {
    console.log(userName, email, location, phoneNumber, password);
  };

  const handleLogIn = () => {
    console.log("Navigate to login page");
  };

  return (
    <Card className="w-full max-w-sm border-t-5 border-t-secondary rounded-md pt-0">
      <CardHeader className="relative overflow-hidden border border-primary/35 px-6 py-8">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/assets/image/header_background.png')",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-white/85" aria-hidden />
        <div className="relative z-10 flex flex-col items-center justify-center">
          <CardTitle className="flex text-2xl font-bold">
            <div className="text-primary">Swamp</div>
            <div className="text-secondary">Swap</div>
          </CardTitle>
          <CardDescription>The UF International Marketplace</CardDescription>
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
            </div>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full" onClick={handleCreateAccount}>
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
  );
}

export default RegisterPage;
