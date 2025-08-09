import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DollarSign, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/lib/constants";
import { useAuth } from "@/lib/useAuth";

export default function LoginPage() {
  /* form state */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");

  /* auth helpers */
  const { setUser }  = useAuth();
  const navigate      = useNavigate();
  const location      = useLocation();
  const from          = location.state?.from?.pathname || "/dashboard";

  /* handle submit */
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const { data } = await api.post("/api/login/", { email, password });
      localStorage.setItem(ACCESS_TOKEN,  data.access);
      localStorage.setItem(REFRESH_TOKEN, data.refresh);
      setUser(data.user);
      navigate(from, { replace: true });
    } catch {
      setError("Invalid email or password");
    }
  }

  /* UI */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 text-zinc-100 px-4">
      {/* logo & heading */}
      <div className="flex flex-col items-center mb-12">
        <div className="flex items-center mb-2">
          <DollarSign size={32} className="text-white mr-2" />
          <h1 className="text-3xl font-semibold text-white">ExpenseTracker</h1>
        </div>
        <p className="text-zinc-400">
          Welcome back! Sign in to your account
        </p>
      </div>

      {/* auth card */}
      <Card className="w-full max-w-md bg-black border-zinc-800">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-2xl text-white">Sign In</CardTitle>
          <CardDescription className="text-zinc-400">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-6">
          <form onSubmit={handleSubmit} className="grid gap-6">
            {/* email */}
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-white font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-12"
              />
            </div>

            {/* password */}
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-white font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-12 pr-12"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute inset-y-0 right-0 h-12 w-12 hover:bg-transparent"
                >
                  {showPwd ? (
                    <EyeOff size={20} className="text-zinc-400" />
                  ) : (
                    <Eye size={20} className="text-zinc-400" />
                  )}
                </Button>
              </div>
            </div>

            {/* error */}
            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* submit */}
            <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-medium text-base mt-2">
              Sign In
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center pt-0">
          <span className="text-sm text-zinc-400">
            Don't have an account?{" "}
            <Link to="/register" className="underline text-zinc-300 hover:text-white">
              Sign up
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}