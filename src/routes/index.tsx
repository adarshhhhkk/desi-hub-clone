import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Video } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { useCategories, useVideos, type VideoItem } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DESILEAKS — Trending Videos" },
      { name: "description", content: "Browse trending videos on DESILEAKS." },
    ],
  }),
  component: Index,
});

function Index() {
  const videos = useVideos();
  const categories = useCategories();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return videos.filter((v) => {
      if (active !== "All" && v.category.toLowerCase() !== active.toLowerCase()) return false;
      if (!q) return true;
      return (
        v.title.toLowerCase().includes(q) || v.category.toLowerCase().includes(q)
      );
    });
  }, [videos, query, active]);

  const chips = ["All", ...categories];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader query={query} onQueryChange={setQuery} />

      {/* Category filter buttons */}
      <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto px-4 py-2">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={
                "whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
                (active === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-secondary text-foreground hover:bg-muted")
              }
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-[1600px] px-4 py-6">
        <div className="mb-4 flex items-end justify-between">
          <h1 className="text-2xl font-bold">
            {active === "All" ? "Trending now" : active}
          </h1>
          <span className="text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "video" : "videos"}
          </span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((v) => (
              <VideoCard key={v.id} v={v} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function VideoCard({ v }: { v: VideoItem }) {
  return (
    <Link to="/watch/$id" params={{ id: v.id }} className="group block">
      <Thumb v={v} />
      <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
        {v.title}
      </h3>
      <span className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        {v.category}
      </span>
    </Link>
  );
}

export function Thumb({ v }: { v: VideoItem }) {
  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-md"
      style={{
        background: v.thumbnail
          ? undefined
          : `linear-gradient(135deg, oklch(0.35 0.15 ${v.hue}), oklch(0.12 0.05 ${(v.hue + 60) % 360}))`,
      }}
    >
      {v.thumbnail && (
        <img src={v.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      )}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
        <div className="rounded-full bg-primary p-3 text-primary-foreground shadow-lg">
          <Video className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 px-6 py-16 text-center">
      <Search className="mb-3 h-8 w-8 text-muted-foreground" />
      <h3 className="text-sm font-semibold">No videos found</h3>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        {query
          ? `Nothing matches "${query}". Try a different keyword or category.`
          : "No videos in this category yet."}
      </p>
    </div>
  );
}
