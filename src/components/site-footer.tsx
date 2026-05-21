import { useState } from "react";
import { Sun, Moon, ArrowUpRight } from "lucide-react";

export function SiteFooter() {
  const [dark, setDark] = useState(() =>
    typeof window !== "undefined" ? document.documentElement.classList.contains("dark") : false
  );

  const toggleTheme = () => {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
  };

  return (
    <footer className="mt-auto border-t border-kite-border bg-kite-card/20 py-8 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-kite-fg/60 font-medium">
        <div className="flex items-center gap-2">
          <span>Powered by</span>
          <a
            href="https://gokite.ai"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-0.5 text-kite-primary hover:text-kite-fg font-semibold transition-colors"
          >
            Kite <ArrowUpRight className="w-3 h-3" />
          </a>
          <span className="opacity-45">•</span>
          <span>Chain ID 2366</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="https://kitescan.ai" target="_blank" rel="noreferrer" className="hover:text-kite-fg transition-colors">
            KiteScan
          </a>
          <a href="https://agentid-seven.vercel.app" target="_blank" rel="noreferrer" className="hover:text-kite-fg transition-colors">
            AgentID
          </a>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full border border-kite-border/80 hover:bg-kite-muted hover:text-kite-fg text-kite-fg/70 transition-all"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="w-4 h-4 text-[#e2c161]" /> : <Moon className="w-4 h-4 text-kite-primary" />}
          </button>
        </div>
      </div>
    </footer>
  );
}
