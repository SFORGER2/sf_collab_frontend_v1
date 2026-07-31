import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import ShinyText from "./ui/ShinyText";
import ShineButton from "./ui/ShineButton";
import { Input } from "./ui/input";

const ADMIN_USER = "admin";
const ADMIN_PASS = "waitlist2025";

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setError("");
      // Pass role info to parent (important for ProtectedRoute)
      onLogin({ role: "admin", username });
    } else {
      setError("❌ Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0a0b10] to-[#11131a]">
      <Card className="w-full max-w-sm bg-[#0d0f17] border border-slate-800 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-white">
            <ShinyText text="Admin Login" speed={3} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              className="bg-slate-900 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-900 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
            {error && (
              <div className="text-red-500 text-sm font-semibold">{error}</div>
            )}
            <ShineButton
              label="Login"
              size="md"
              bgColor="linear-gradient(325deg, hsl(220 100% 56%) 0%, hsl(220 100% 69%) 55%, hsl(220 100% 56%) 90%)"
              type="submit"
              className="w-full mt-2"
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
