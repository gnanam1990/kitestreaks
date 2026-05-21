export function PreviewBadge({ children = "PREVIEW" }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded-sm bg-kite-primary/15 text-kite-primary border border-kite-primary/30">
      {children}
    </span>
  );
}
