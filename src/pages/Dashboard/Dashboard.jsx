import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../context/ThemeContext";
import {
  Home,
  PlusSquare,
  Activity,
  Settings,
  LogOut,
  User,
  Filter,
  Search,
  Moon,
  Sun,
} from "lucide-react";
import HomeFeed from "./HomeFeed";
import CreatePost from "./CreatePost";
import ActivityPage from "./Activity";
import SettingsPage from "./Settings";

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        navigate("/", { replace: true });
        return;
      }
      setUser(data.user);
      setLoading(false);
    };
    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "create", label: "Create Post", icon: PlusSquare },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const mobileNavItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "create", label: "Create", icon: PlusSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeFeed
            user={user}
            sortBy={sortBy}
            activeFilter={activeFilter}
            searchTerm={searchTerm}
          />
        );
      case "create":
        return <CreatePost user={user} />;
      case "activity":
        return <ActivityPage />;
      case "settings":
        return <SettingsPage user={user} />;
      default:
        return (
          <HomeFeed
            user={user}
            sortBy={sortBy}
            activeFilter={activeFilter}
            searchTerm={searchTerm}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-blue-900">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  const displayUsername = user?.user_metadata?.username || user?.email?.split("@")[0] || "User";
  const avatarLetter = displayUsername.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-gray-900 dark:to-blue-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-48 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full left-0 top-0 z-20 shadow-sm">
        <div className="flex-1 py-8 px-3">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-blue-600 text-white font-semibold shadow-md dark:bg-blue-700"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <item.icon size={18} />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        {/* Sidebar Footer - Logout */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left dark:text-red-400 dark:hover:bg-red-900"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-48 min-h-screen">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Discussion Forum</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? (
                <Moon size={22} className="text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun size={22} className="text-yellow-400" />
              )}
            </button>

            {/* Filter Icon */}
            <div className="relative">
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter size={22} className="text-gray-600 dark:text-gray-400" />
              </button>
              {filterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-30">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setActiveFilter("all");
                        setFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded text-sm ${
                        activeFilter === "all"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      All Posts
                    </button>
                    <button
                      onClick={() => {
                        setActiveFilter("today");
                        setFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded text-sm ${
                        activeFilter === "today"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => {
                        setActiveFilter("week");
                        setFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded text-sm ${
                        activeFilter === "week"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      This Week
                    </button>
                    <button
                      onClick={() => {
                        setActiveFilter("month");
                        setFilterDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded text-sm ${
                        activeFilter === "month"
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      This Month
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
              />
            </div>

            {/* Profile Icon with Popup */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <User size={22} className="text-gray-600 dark:text-gray-400" />
              </button>
              {/* Profile Popup Card */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-30">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-semibold text-lg">
                        {avatarLetter}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {displayUsername}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Logged In</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded text-sm dark:text-red-400 dark:hover:bg-red-900"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">
          {renderContent()}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 py-2 flex justify-around items-center z-20 shadow-lg">
          {mobileNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                activeTab === item.id ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <item.icon size={22} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          ))}
          <button
            onClick={toggleTheme}
            className="flex flex-col items-center p-2 text-gray-500 dark:text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? <Moon size={22} /> : <Sun size={22} />}
            <span className="text-xs mt-1 font-medium">Theme</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex flex-col items-center p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut size={22} />
            <span className="text-xs mt-1 font-medium">Logout</span>
          </button>
        </nav>
      </div>
    </div>
  );
}