"use client";

import { Switch } from "@heroui/react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/contexts/theme";

export const ThemeToggle = ({ showLabel = false }: { showLabel?: boolean }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Switch
        isSelected={theme === "dark"}
        onChange={toggleTheme}
        aria-label="Toggle dark mode"
      >
        <Switch.Content>
          <Switch.Control className="data-[selected=true]:bg-primary">
            <Switch.Thumb className="flex items-center justify-center">
              {theme === "dark" ? (
                <MoonIcon className="size-3 text-primary" />
              ) : (
                <SunIcon className="size-3 text-amber-500" />
              )}
            </Switch.Thumb>
          </Switch.Control>
        </Switch.Content>
      </Switch>
      {showLabel && (
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 min-w-16">
          {theme === "dark" ? "Dark Mode" : "Light Mode"}
        </span>
      )}
    </div>
  );
};

export default ThemeToggle;
