import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { ArrowLeft, DollarSign, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/lib/constants";
import { useAuth } from "@/lib/useAuth";

export default function RegisterPage() {
  /* -------------------- form state -------------------- */
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPwd, setConfPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [error, setError] = useState("");

  /* -------------------- helpers -------------------- */
  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confPwd) {
      setError("Passwords do not match");
      return;
    }

    try {
      const { data } = await api.post("/api/register/", {
        first_name: first,
        last_name: last,
        email,
        password,
        confirm_password: confPwd,
      });

      /* backend returns { access, refresh, user } */
      localStorage.setItem(ACCESS_TOKEN, data.access);
      localStorage.setItem(REFRESH_TOKEN, data.refresh);
      setUser(data.user);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Registration failed – email already in use?");
    }
  }

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 text-zinc-100 px-4 py-8">
      {/* header strip with back arrow */}
      <button
        onClick={() => navigate("/login")}
        className="absolute left-4 top-4 text-zinc-400 hover:text-zinc-200"
        aria-label="Back to login"
      >
        <ArrowLeft size={24} />
      </button>

      {/* app logo & subtitle */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center mb-2">
          <DollarSign size={32} className="text-white mr-2" />
          <h1 className="text-3xl font-semibold text-white">ExpenseTracker</h1>
        </div>
        <p className="text-zinc-400">
          Create your account to start tracking expenses
        </p>
      </div>

      {/* form card */}
      <Card className="w-full max-w-md bg-black border-zinc-800">
        <CardHeader className="space-y-2 pb-4">
          <CardTitle className="text-2xl text-white">Create Account</CardTitle>
          <CardDescription className="text-zinc-400">
            Enter your information to get started
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-4">
          <form onSubmit={handleSubmit} className="grid gap-4">
            {/* names grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first" className="text-white font-medium">
                  First Name
                </Label>
                <Input
                  id="first"
                  value={first}
                  onChange={(e) => setFirst(e.target.value)}
                  required
                  placeholder="John"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-10"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="last" className="text-white font-medium">
                  Last Name
                </Label>
                <Input
                  id="last"
                  value={last}
                  onChange={(e) => setLast(e.target.value)}
                  required
                  placeholder="Doe"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-10"
                />
              </div>
            </div>

            {/* email */}
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-white font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="john.doe@example.com"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-10"
              />
            </div>

            {/* password */}
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-white font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-10 pr-10"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute inset-y-0 right-0 h-10 w-10 hover:bg-transparent"
                >
                  {showPwd ? (
                    <EyeOff size={16} className="text-zinc-400" />
                  ) : (
                    <Eye size={16} className="text-zinc-400" />
                  )}
                </Button>
              </div>
            </div>

            {/* confirm password */}
            <div className="grid gap-2">
              <Label htmlFor="conf" className="text-white font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="conf"
                  type={showConf ? "text" : "password"}
                  value={confPwd}
                  onChange={(e) => setConfPwd(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-10 pr-10"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowConf(!showConf)}
                  className="absolute inset-y-0 right-0 h-10 w-10 hover:bg-transparent"
                >
                  {showConf ? (
                    <EyeOff size={16} className="text-zinc-400" />
                  ) : (
                    <Eye size={16} className="text-zinc-400" />
                  )}
                </Button>
              </div>
            </div>

            {/* error */}
            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* submit */}
            <Button
              type="submit"
              className="w-full h-10 bg-white text-black hover:bg-zinc-200 font-medium text-base mt-2"
            >
              Create Account
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center pt-0 pb-4">
          <span className="text-sm text-zinc-400">
            Already have an account?{" "}
            <Link to="/login" className="underline text-zinc-300 hover:text-white">
              Sign in
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}

