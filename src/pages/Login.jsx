import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center text-slate-800 mb-2">
          Discussion Forum
        </h1>

        <p className="text-center text-slate-500 mb-8">
          Welcome Back
        </p>

        <div className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-4 py-3"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 pr-12"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              👁️
            </button>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Sign In
          </button>
          <p className="text-center text-sm text-slate-600 mt-4">
  Don't have an account?
  <Link
    to="/signup"
    className="ml-1 text-blue-600 font-medium hover:underline"
  >
    Sign Up
  </Link>
</p>

        </div>

        <p className="text-center text-sm mt-6 text-slate-500">
          Don't have an account?
          <span className="text-blue-600 ml-1 cursor-pointer">
            Sign Up
          </span>
        </p>

      </div>
    </div>
  );
}