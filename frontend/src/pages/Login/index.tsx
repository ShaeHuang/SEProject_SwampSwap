import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { login, type LoginData, type LoginResponse } from "@/api/auth";
import { toast } from "sonner";
import { validateEmail, validatePassword } from "@/lib/validation";
import { useNavigate } from "react-router-dom";
function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSignUp = () => {
    navigate("/register");
  };

  const handleLogin = async () => {
    const newErrors: { email?: string; password?: string } = {};

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const data: LoginData = {
      email: email,
      password: password,
    };
    const response: LoginResponse = await login(data);
    if (response.message === "Login successful") {
      toast.success("Login successful");
      navigate("/");
    } else {
      console.log("Login failed");
    }
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
          </div>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-bold">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="albert@ufl.edu"
                  required
                  value={email}
                  onChange={handleEmailChange}
                />
                {errors.email && (
                  <p className="text-destructive text-sm">{errors.email}</p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="font-bold">
                    Password
                  </Label>
                  {/* <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a> */}
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                />
                {errors.password && (
                  <p className="text-destructive text-sm">{errors.password}</p>
                )}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full" onClick={handleLogin}>
            Sign In
          </Button>
          <div className="flex items-center justify-center gap-2">
            <div className="text-muted-foreground text-sm">
              New to SwampSwap?
            </div>
            <div
              className="text-secondary font-bold text-sm cursor-pointer"
              onClick={handleSignUp}
            >
              Create an Account
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default LoginPage;
