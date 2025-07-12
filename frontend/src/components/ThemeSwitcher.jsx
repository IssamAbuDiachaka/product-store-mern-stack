import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import React from "react";

function ThemeSwitcher () {
    const {theme, setTheme} = useTheme();
    return (
        <div>
            <div>    
                {theme === "light" ? (
                    <MoonIcon
                    size={24}
                    className="p-1" 
                    onClick={() => setTheme("dark")}
                    />
                ):(
                    <SunIcon
                    onClick={() => setTheme("light")}
                    size={24}
                    className="p-1"
                    />
                ) }
            </div>
        </div>
    );
}

export default ThemeSwitcher;