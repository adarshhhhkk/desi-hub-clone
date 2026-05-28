import { createFileRoute } from "@tanstack/react-router";
import { Search, Menu, Flame, Clock, Star, Eye, Video, TrendingUp, Tag, Bell, User } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ClipHub — Discover Short Videos" },
      { name: "description", content: "Browse trending short videos across travel, food, nature, sports, and more." },
      { property: "og:title", content: "ClipHub — Discover Short Videos" },
      { property: "og:description", content: "Browse trending short videos across travel, food, nature, sports, and more." },
    ],
  }),
  component: Index,
});

const categories = [
  { name: "Trending", icon: TrendingUp },
  { name: "Travel", icon: Flame },
  { name: "Food & Cooking", icon: Flame },
  { name: "Nature", icon: Star },
  { name: "Sports", icon: Flame },
  { name: "Music", icon: Star },
  { name: "Tech", icon: Star },
  { name: "Gaming", icon: Flame },
  { name: "Comedy", icon: Star },
  { name: "DIY & Crafts", icon: Star },
  { name: "Pets", icon: Star },
  { name: "Fitness", icon: Flame },
];

const tags = [
  "sunset", "street food", "drone", "mountains", "ramen", "trail run", "coffee",
  "skateboard", "synthwave", "macro", "timelapse", "puppy", "cyberpunk", "yoga",
  "espresso", "northern lights", "vintage", "noodles", "surf", "lofi", "origami",
  "watercolor", "espresso", "barista", "kayak",
];

const videos = [
  { title: "Sunset over Bali rice terraces (4K drone)", channel: "WanderLens", views: "1.2M", time: "12:04", cat: "Travel", hue: 25 },
  { title: "Tokyo ramen shop crawl — 6 bowls in one night", channel: "EatTokyo", views: "842K", time: "08:31", cat: "Food", hue: 18 },
  { title: "Aurora timelapse from a frozen Norwegian fjord", channel: "NorthSky", views: "2.4M", time: "03:47", cat: "Nature", hue: 200 },
  { title: "Building a walnut espresso bar from scratch", channel: "ShopMade", views: "318K", time: "21:09", cat: "DIY", hue: 35 },
  { title: "Street skating Lisbon at golden hour", channel: "Pushwood", views: "501K", time: "06:22", cat: "Sports", hue: 280 },
  { title: "Macro: dew drops on a spider's web", channel: "TinyWorlds", views: "97K", time: "02:18", cat: "Nature", hue: 160 },
  { title: "Lofi café session — 1 hour of mellow beats", channel: "RoomTone", views: "3.1M", time: "59:58", cat: "Music", hue: 320 },
  { title: "Cyberpunk Bangkok — neon street walk", channel: "NightCity", views: "688K", time: "14:45", cat: "Travel", hue: 300 },
  { title: "How a sourdough loaf actually rises", channel: "CrumbLab", views: "224K", time: "11:12", cat: "Food", hue: 40 },
  { title: "Pro tip: edit photos faster with masks", channel: "PixelPilot", views: "73K", time: "07:50", cat: "Tech", hue: 240 },
  { title: "Golden retriever meets snow for the first time", channel: "PawCam", views: "5.7M", time: "01:42", cat: "Pets", hue: 50 },
  { title: "Morning mobility routine — 10 minutes", channel: "MoveDaily", views: "412K", time: "10:01", cat: "Fitness", hue: 140 },
];

function Thumb({ hue, time }: { hue: number; time: string }) {
  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-md"
      style={{
        background: `linear-gradient(135deg, oklch(0.45 0.18 ${hue}), oklch(0.22 0.08 ${(hue + 60) % 360}))`,
      }}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 55%)",
        }}
      />
      <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
        {time}
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
        <div className="rounded-full bg-primary p-3 text-primary-foreground shadow-lg">
          <Video className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4">
          <button className="rounded p-2 hover:bg-secondary md:hidden" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
          <a href="#" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
              <Video className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Clip<span className="text-primary">Hub</span>
            </span>
          </a>

          <form className="ml-4 hidden flex-1 max-w-xl md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search clips, channels, tags…"
                className="h-9 w-full rounded-l-full border border-border bg-input pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              className="h-9 rounded-r-full border border-l-0 border-border bg-secondary px-5 text-sm hover:bg-muted"
            >
              Search
            </button>
          </form>

          <div className="ml-auto flex items-center gap-1">
            <button className="rounded p-2 hover:bg-secondary" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </button>
            <button className="rounded p-2 hover:bg-secondary" aria-label="Account">
              <User className="h-5 w-5" />
            </button>
            <button className="ml-2 hidden rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90 sm:block">
              Upload
            </button>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto border-t border-border px-4 py-2">
          {categories.map((c, i) => (
            <button
              key={c.name}
              className={
                "whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
                (i === 0
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-secondary text-foreground hover:bg-muted")
              }
            >
              {c.name}
            </button>
          ))}
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-6">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-32 space-y-1">
            <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Browse
            </div>
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <a
                  key={c.name}
                  href="#"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-secondary"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span>{c.name}</span>
                </a>
              );
            })}

            <div className="mt-6 px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Library
            </div>
            <a href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-secondary">
              <Clock className="h-4 w-4 text-muted-foreground" /> History
            </a>
            <a href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-secondary">
              <Star className="h-4 w-4 text-muted-foreground" /> Favorites
            </a>
            <a href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-secondary">
              <Eye className="h-4 w-4 text-muted-foreground" /> Watch later
            </a>
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {/* Hero */}
          <section className="mb-8 overflow-hidden rounded-xl border border-border bg-card">
            <div className="grid gap-0 md:grid-cols-[1.4fr_1fr]">
              <div className="relative aspect-video md:aspect-auto">
                <Thumb hue={200} time="04:18" />
              </div>
              <div className="flex flex-col justify-center gap-3 p-6">
                <span className="w-fit rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  Featured
                </span>
                <h1 className="text-2xl font-bold leading-tight md:text-3xl">
                  Aurora timelapse from a frozen Norwegian fjord
                </h1>
                <p className="text-sm text-muted-foreground">
                  Three nights, minus twenty, one tripod. A quiet study of light over the Arctic Ocean.
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">NorthSky</span>
                  <span>•</span>
                  <span>2.4M views</span>
                  <span>•</span>
                  <span>3 days ago</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
                    Watch now
                  </button>
                  <button className="rounded-full border border-border bg-secondary px-4 py-2 text-sm hover:bg-muted">
                    + Watch later
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section heading */}
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-lg font-bold">Trending now</h2>
            <a href="#" className="text-xs font-medium text-primary hover:underline">
              See all →
            </a>
          </div>

          {/* Video grid */}
          <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((v) => (
              <article key={v.title} className="group cursor-pointer">
                <Thumb hue={v.hue} time={v.time} />
                <div className="mt-3 flex gap-3">
                  <div
                    className="h-9 w-9 shrink-0 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, oklch(0.6 0.18 ${v.hue}), oklch(0.4 0.12 ${(v.hue + 80) % 360}))`,
                    }}
                  />
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
                      {v.title}
                    </h3>
                    <div className="mt-1 text-xs text-muted-foreground">{v.channel}</div>
                    <div className="text-xs text-muted-foreground">
                      {v.views} views • {v.cat}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Tag cloud */}
          <section className="mt-12 rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Popular tags</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((t, i) => (
                <a
                  key={t + i}
                  href="#"
                  className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary"
                >
                  #{t}
                </a>
              ))}
            </div>
          </section>
        </main>
      </div>

      <footer className="mt-12 border-t border-border bg-card">
        <div className="mx-auto flex max-w-[1600px] flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground">
              <Video className="h-3.5 w-3.5" />
            </div>
            <span className="font-bold text-foreground">ClipHub</span>
            <span>© 2026</span>
          </div>
          <div className="flex flex-wrap gap-5">
            <a href="#" className="hover:text-foreground">About</a>
            <a href="#" className="hover:text-foreground">Creators</a>
            <a href="#" className="hover:text-foreground">Advertise</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
