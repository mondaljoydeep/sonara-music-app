interface SourceBadgeProps {
  source: "youtube" | "audius" | "uploaded" | "saavn";
}
export function SourceBadge({ source }: SourceBadgeProps) {
  const map = {
    youtube: { label: "YT", className: "bg-red-600 text-white" },
    audius: { label: "A", className: "bg-purple-600 text-white" },
    uploaded: { label: "MY", className: "bg-[#1ed760] text-black" },
    saavn: { label: "JS", className: "bg-orange-500 text-white" },
  } as const;
  const cfg = map[source];
  return (
    <span
      className={`absolute top-1.5 right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
