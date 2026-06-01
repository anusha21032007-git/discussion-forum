import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    if (!username.trim()) {
      setError("Username is required");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.trim(),
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 py-8">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Discussion Forum</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Create your account</p>
        </div>
        {error && (
          <div className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        <div className="space-y-4">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          {/* Password */}
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pr-10 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {/* Sign Up button */}
          <button
            type="button"
            onClick={handleSignup}
            className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 text-white font-medium py-2 rounded-md transition-colors duration-200 disabled:opacity-50 shadow-sm hover:shadow-md"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
          {/* Sign In link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link to="/" className="text-blue-600 hover:underline dark:text-blue-400">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}