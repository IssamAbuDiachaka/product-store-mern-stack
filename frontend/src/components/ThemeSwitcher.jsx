import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before showing icons
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 cursor-pointer"
    >
      {theme === "light" ? (
        <Moon size={18} className="text-gray-800" />
      ) : (
        <Sun size={18} className="text-white-400" />
      )}
    </button>
  );
}
