import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        navigate("/home", { replace: true });
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
        {/* Icon and Header */}
        <div className="flex items-center justify-center mb-4">
          <svg className="text-gray-500 dark:text-gray-400 w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zM6 15h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4z" />
          </svg>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Discussion Forum</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to your account</p>
        </div>
        {/* Form */}
        <div className="space-y-4">
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
          {/* Sign In button */}
          <button
            type="button"
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 text-white font-medium py-2 rounded-md transition-colors duration-200 disabled:opacity-50 shadow-sm hover:shadow-md"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          {/* Sign Up link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline dark:text-blue-400">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}