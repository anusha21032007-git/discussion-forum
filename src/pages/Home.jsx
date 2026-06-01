import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          setError(error.message);
        } else {
          setUser(data);
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {user?.user?.email}
          </h1>
          <p className="mt-2 text-gray-600">
            You're now logged in to Discussion Forum
          </p>
          <button
            onClick={async () => {
              setLoading(true);
              setError("");
              try {
                const { error } = await supabase.auth.signOut();
                if (error) {
                  setError(error.message);
                } else {
                  navigate("/login", { replace: true });
                }
              } catch (err) {
                setError(err.message);
              } finally {
                setLoading(false);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}