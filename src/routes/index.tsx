import { createFileRoute } from "@tanstack/react-router";
import { Search, Menu, Flame, Clock, Star, Eye, Video, TrendingUp, Bell, User, Upload, Download, LogOut, X, Link as LinkIcon, FileVideo, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import logoWoman from "@/assets/logo-woman.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DESILEAKS — Trending Videos" },
      { name: "description", content: "Browse trending videos on DESILEAKS." },
      { property: "og:title", content: "DESILEAKS — Trending Videos" },
      { property: "og:description", content: "Browse trending videos on DESILEAKS." },
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

type VideoItem = {
  id: string;
  title: string;
  category: string;
  thumbnail: string | null; // data URL
  source: { kind: "link"; url: string } | { kind: "file"; dataUrl: string; filename: string };
  hue: number;
  createdAt: number;
};

const STORAGE_KEY = "desileaks.videos.v1";
const ADMIN_KEY = "desileaks.admin.v1";
const ADMIN_PASSWORD = "admin123";

const seedVideos: VideoItem[] = [
  { id: "s1", title: "Mumbai monsoon street walk", category: "Travel", thumbnail: null, source: { kind: "link", url: "#" }, hue: 25, createdAt: 0 },
  { id: "s2", title: "Late night chai stall", category: "Food", thumbnail: null, source: { kind: "link", url: "#" }, hue: 18, createdAt: 0 },
  { id: "s3", title: "Backstage at a Delhi gig", category: "Music", thumbnail: null, source: { kind: "link", url: "#" }, hue: 320, createdAt: 0 },
  { id: "s4", title: "Goa beach sunrise", category: "Nature", thumbnail: null, source: { kind: "link", url: "#" }, hue: 200, createdAt: 0 },
  { id: "s5", title: "Rooftop cricket finals", category: "Sports", thumbnail: null, source: { kind: "link", url: "#" }, hue: 140, createdAt: 0 },
  { id: "s6", title: "Diwali fireworks 4K", category: "Festival", thumbnail: null, source: { kind: "link", url: "#" }, hue: 35, createdAt: 0 },
  { id: "s7", title: "Auto rickshaw POV ride", category: "Travel", thumbnail: null, source: { kind: "link", url: "#" }, hue: 50, createdAt: 0 },
  { id: "s8", title: "Street dance cypher", category: "Dance", thumbnail: null, source: { kind: "link", url: "#" }, hue: 280, createdAt: 0 },
];

function Thumb({ hue, thumbnail }: { hue: number; thumbnail: string | null }) {
  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-md"
      style={{
        background: thumbnail
          ? undefined
          : `linear-gradient(135deg, oklch(0.45 0.18 ${hue}), oklch(0.22 0.08 ${(hue + 60) % 360}))`,
      }}
    >
      {thumbnail && (
        <img src={thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      )}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent 55%)",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
        <div className="rounded-full bg-primary p-3 text-primary-foreground shadow-lg">
          <Video className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function Index() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [pwd, setPwd] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    setIsAdmin(localStorage.getItem(ADMIN_KEY) === "1");
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const stored: VideoItem[] = raw ? JSON.parse(raw) : [];
      setVideos([...stored, ...seedVideos]);
    } catch {
      setVideos(seedVideos);
    }
  }, []);

  const saveVideos = (list: VideoItem[]) => {
    const userOnly = list.filter((v) => !v.id.startsWith("s"));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userOnly));
    setVideos(list);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_KEY, "1");
      setIsAdmin(true);
      setShowLogin(false);
      setPwd("");
      setLoginErr("");
    } else {
      setLoginErr("Wrong password");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_KEY);
    setIsAdmin(false);
  };

  const addVideo = (v: VideoItem) => {
    saveVideos([v, ...videos]);
    setShowUpload(false);
  };

  const downloadVideo = (v: VideoItem) => {
    if (v.source.kind === "file") {
      const a = document.createElement("a");
      a.href = v.source.dataUrl;
      a.download = v.source.filename || `${v.title}.mp4`;
      a.click();
    } else {
      window.open(v.source.url, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4">
          <button className="rounded p-2 hover:bg-secondary md:hidden" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
          <a href="#" className="flex items-center gap-2">
            <img src={logoWoman} alt="DESILEAKS" width={32} height={32} className="h-8 w-8 rounded object-contain" />
            <span className="text-lg font-bold tracking-tight">
              DESI<span className="text-primary">LEAKS</span>
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
            {isAdmin ? (
              <>
                <button
                  onClick={() => setShowUpload(true)}
                  className="ml-2 hidden items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:opacity-90 sm:inline-flex"
                >
                  <Upload className="h-4 w-4" /> Upload
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded p-2 hover:bg-secondary"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm font-semibold hover:bg-muted"
              >
                <User className="h-4 w-4" /> Admin
              </button>
            )}
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
          {/* Section heading */}
          <div className="mb-4 flex items-end justify-between">
            <h1 className="text-2xl font-bold">Trending now</h1>
            <a href="#" className="text-xs font-medium text-primary hover:underline">
              See all →
            </a>
          </div>

          {/* Video grid */}
          <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((v) => (
              <article key={v.id} className="group cursor-pointer">
                <Thumb hue={v.hue} thumbnail={v.thumbnail} />
                <div className="mt-3">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
                    {v.title}
                  </h3>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="inline-block rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {v.category}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => downloadVideo(v)}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] hover:border-primary hover:text-primary"
                      >
                        <Download className="h-3 w-3" /> Download
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>

      <footer className="mt-12 border-t border-border bg-card">
        <div className="mx-auto flex max-w-[1600px] flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <img src={logoWoman} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
            <span className="font-bold text-foreground">DESILEAKS</span>
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

      {showLogin && (
        <Modal onClose={() => setShowLogin(false)} title="Admin login">
          <form onSubmit={handleLogin} className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Demo password: <code className="rounded bg-secondary px-1">admin123</code>
            </p>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="Password"
              autoFocus
              className="h-10 w-full rounded-md border border-border bg-input px-3 text-sm outline-none focus:border-primary"
            />
            {loginErr && <p className="text-xs text-destructive">{loginErr}</p>}
            <button
              type="submit"
              className="h-10 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Sign in
            </button>
          </form>
        </Modal>
      )}

      {showUpload && isAdmin && (
        <Modal onClose={() => setShowUpload(false)} title="Upload video">
          <UploadForm onSubmit={addVideo} />
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">{title}</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-secondary" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function UploadForm({ onSubmit }: { onSubmit: (v: VideoItem) => void }) {
  const [mode, setMode] = useState<"link" | "file">("link");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [thumb, setThumb] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const readAsDataUrl = (f: File) =>
    new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(f);
    });

  const handleThumb = async (f: File | null) => {
    if (!f) return setThumb(null);
    setThumb(await readAsDataUrl(f));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!title.trim()) return setErr("Title required");
    if (!category.trim()) return setErr("Category required");
    setBusy(true);
    try {
      let source: VideoItem["source"];
      if (mode === "link") {
        if (!link.trim()) throw new Error("Link required");
        source = { kind: "link", url: link.trim() };
      } else {
        if (!file) throw new Error("File required");
        const dataUrl = await readAsDataUrl(file);
        source = { kind: "file", dataUrl, filename: file.name };
      }
      onSubmit({
        id: crypto.randomUUID(),
        title: title.trim(),
        category: category.trim(),
        thumbnail: thumb,
        source,
        hue: Math.floor(Math.random() * 360),
        createdAt: Date.now(),
      });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("link")}
          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm ${
            mode === "link" ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary"
          }`}
        >
          <LinkIcon className="h-4 w-4" /> By link
        </button>
        <button
          type="button"
          onClick={() => setMode("file")}
          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm ${
            mode === "file" ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary"
          }`}
        >
          <FileVideo className="h-4 w-4" /> Upload file
        </button>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-9 w-full rounded-md border border-border bg-input px-3 text-sm outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Category (any)</label>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Travel, Music, anything…"
          className="h-9 w-full rounded-md border border-border bg-input px-3 text-sm outline-none focus:border-primary"
        />
      </div>

      {mode === "link" ? (
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Video link</label>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://…"
            className="h-9 w-full rounded-md border border-border bg-input px-3 text-sm outline-none focus:border-primary"
          />
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Video file</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-primary-foreground"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          <ImageIcon className="mr-1 inline h-3 w-3" /> Thumbnail (optional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleThumb(e.target.files?.[0] ?? null)}
          className="block w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-xs file:font-semibold"
        />
        {thumb && (
          <img src={thumb} alt="" className="mt-2 h-20 w-32 rounded-md object-cover" />
        )}
      </div>

      {err && <p className="text-xs text-destructive">{err}</p>}

      <button
        type="submit"
        disabled={busy}
        className="h-10 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Uploading…" : "Publish"}
      </button>
    </form>
  );
}
