import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevents hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <button
      onClick={() => setTheme(currentTheme === "light" ? "dark" : "light")}
      className="p-2 rounded-full bg-gray-200 dark:bg-[#2d2d2d] hover:bg-gray-300 dark:hover:bg-[#3a3a3a] transition-colors"
    >
      {currentTheme === "light" ? (
        <Moon className="text-gray-800" size={20} />
      ) : (
        <Sun className="text-yellow-400" size={20} />
      )}
    </button>
  );
}
