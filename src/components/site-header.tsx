import { useState } from "react";
import { Search } from "lucide-react";
import { KiteLogo } from "./kite-logo";

interface Props {
  onSearch: (address: string) => void;
}

export function SiteHeader({ onSearch }: Props) {
  const [v, setV] = useState("");
  return (
    <header className="sticky top-0 z-50 w-full border-b border-kite-border bg-kite-bg/95 backdrop-blur-sm shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <KiteLogo />
          <span className="hidden sm:inline-block h-4 w-px bg-kite-border" />
          <span className="hidden sm:inline-block font-sans text-xs font-bold tracking-widest text-kite-primary uppercase">
            KiteStreaks
          </span>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (/^0x[a-fA-F0-9]{40}$/.test(v.trim())) onSearch(v.trim());
          }}
          className="flex-1 max-w-md mx-4 relative"
        >
          <input
            value={v}
            onChange={(e) => setV(e.target.value)}
            placeholder="0x… address"
            className="w-full bg-kite-muted border border-kite-border/80 focus:border-kite-primary focus:outline-none rounded-md py-1.5 pl-9 pr-3 text-sm font-mono text-kite-fg placeholder-kite-fg/40"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-kite-fg/30" />
        </form>
        <a
          href="https://github.com/gnanam1990/kitestreaks"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold tracking-widest uppercase text-kite-fg/55 hover:text-kite-fg transition-colors shrink-0"
        >
          GitHub
        </a>
      </div>
    </header>
  );
}
