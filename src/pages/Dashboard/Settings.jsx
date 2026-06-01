import { useState } from "react";
import { Bell, Shield, Moon, Globe } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function Settings({ user }) {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, darkModeState] = useState(theme === "dark");
  const [publicProfile, setPublicProfile] = useState(true);

  // Update dark mode state when theme changes
  React.useEffect(() => {
    darkModeState(theme === "dark");
  }, [theme]);

  const settingsGroups = [
    {
      title: "Account",
      items: [
        {
          label: "Email",
          value: user?.email || "Not available",
          icon: Globe,
          actionable: false,
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          label: "Notifications",
          icon: Bell,
          actionable: true,
          state: notifications,
          onChange: () => setNotifications(!notifications),
        },
        {
          label: "Dark Mode",
          icon: Moon,
          actionable: true,
          state: darkMode,
          onChange: toggleTheme,
        },
      ],
    },
    {
      title: "Privacy",
      items: [
        {
          label: "Public Profile",
          icon: Shield,
          actionable: true,
          state: publicProfile,
          onChange: () => setPublicProfile(!publicProfile),
        },
      ],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Settings</h2>
      <div className="space-y-6">
        {settingsGroups.map((group) => (
          <div
            key={group.title}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
          >
            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">
                {group.title}
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {group.items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className="text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {item.label}
                    </span>
                  </div>
                  {item.actionable ? (
                    <button
                      onClick={item.onChange}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        item.state ? "bg-blue-600 dark:bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          item.state ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}