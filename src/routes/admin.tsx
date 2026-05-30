import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  FileVideo,
  Link as LinkIcon,
  Tags,
  ListVideo,
  Trash2,
  Pencil,
  Plus,
  Save,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import {
  addCategory,
  addVideo,
  deleteVideo,
  removeCategory,
  renameCategory,
  updateVideo,
  useCategories,
  useSession,
  useVideos,
  type VideoItem,
} from "@/lib/store";
import { putBlob, resizeImageToDataUrl } from "@/lib/blobs";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type Tab = "file" | "link" | "categories" | "videos";

function AdminPage() {
  const session = useSession();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("file");

  useEffect(() => {
    if (session === null) return; // not loaded yet
    if (!session?.isAdmin) navigate({ to: "/" });
  }, [session, navigate]);

  if (!session?.isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="text-xl font-bold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with the admin account to manage content.
          </p>
          <Link to="/" className="mt-4 inline-block text-sm text-primary hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof FileVideo }[] = [
    { id: "file", label: "Upload File", icon: FileVideo },
    { id: "link", label: "Upload Link", icon: LinkIcon },
    { id: "categories", label: "Categories", icon: Tags },
    { id: "videos", label: "All Videos", icon: ListVideo },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage videos, categories, and uploads.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={
                    "flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors " +
                    (tab === t.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground hover:bg-secondary")
                  }
                >
                  <Icon className="h-4 w-4" /> {t.label}
                </button>
              );
            })}
          </nav>

          <section className="rounded-lg border border-border bg-card p-6">
            {tab === "file" && <UploadVideoForm mode="file" />}
            {tab === "link" && <UploadVideoForm mode="link" />}
            {tab === "categories" && <CategoriesManager />}
            {tab === "videos" && <AllVideosManager />}
          </section>
        </div>
      </div>
    </div>
  );
}

function UploadVideoForm({ mode }: { mode: "file" | "link" }) {
  const categories = useCategories();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [thumb, setThumb] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setTitle("");
    setCategory("");
    setLink("");
    setFile(null);
    setThumb(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setOk("");
    if (!title.trim()) return setErr("Title required");
    if (!category.trim()) return setErr("Category required");
    setBusy(true);
    try {
      let source: VideoItem["source"];
      if (mode === "link") {
        if (!link.trim()) throw new Error("Streamable link required");
        source = { kind: "link", url: link.trim() };
      } else {
        if (!file) throw new Error("Video file required");
        const blobId = crypto.randomUUID();
        await putBlob(blobId, file);
        source = {
          kind: "file",
          blobId,
          filename: file.name,
          mimeType: file.type || "video/mp4",
        };
      }
      addVideo({
        id: crypto.randomUUID(),
        title: title.trim(),
        category: category.trim(),
        thumbnail: thumb,
        source,
        hue: Math.floor(Math.random() * 360),
        createdAt: Date.now(),
      });
      if (category.trim() && !categories.includes(category.trim())) {
        addCategory(category.trim());
      }
      setOk("Video published!");
      reset();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="text-lg font-bold">
        {mode === "file" ? "Upload video file" : "Upload by streamable link"}
      </h2>

      <Field label="Title">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Name the video"
          className={inputClass}
        />
      </Field>

      {mode === "link" ? (
        <Field label="Streamable video link">
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://… (YouTube, Vimeo, mp4 etc.)"
            className={inputClass}
          />
        </Field>
      ) : (
        <Field label="Video file">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className={fileInputClass}
          />
          {file && (
            <p className="mt-1 text-xs text-muted-foreground">{file.name}</p>
          )}
        </Field>
      )}

      <Field label="Category">
        <input
          list="admin-categories"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Pick existing or type a new one"
          className={inputClass}
        />
        <datalist id="admin-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Field>

      <Field
        label={
          <>
            <ImageIcon className="mr-1 inline h-3 w-3" /> Thumbnail
          </>
        }
      >
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const f = e.target.files?.[0] ?? null;
            setThumb(f ? await resizeImageToDataUrl(f) : null);
          }}
          className={fileInputClass}
        />
        {thumb && (
          <img src={thumb} alt="" className="mt-2 h-24 w-40 rounded-md object-cover" />
        )}
      </Field>

      {err && <p className="text-xs text-destructive">{err}</p>}
      {ok && <p className="text-xs text-primary">{ok}</p>}

      <button
        type="submit"
        disabled={busy}
        className="h-10 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Uploading…" : "Publish"}
      </button>
    </form>
  );
}

function CategoriesManager() {
  const categories = useCategories();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold">Categories</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          addCategory(name);
          setName("");
        }}
        className="flex gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className={inputClass}
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </form>

      <ul className="divide-y divide-border rounded-md border border-border">
        {categories.length === 0 && (
          <li className="p-4 text-sm text-muted-foreground">No categories yet.</li>
        )}
        {categories.map((c) => (
          <li key={c} className="flex items-center gap-3 p-3">
            {editing === c ? (
              <>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className={inputClass + " flex-1"}
                  autoFocus
                />
                <button
                  onClick={() => {
                    renameCategory(c, draft);
                    setEditing(null);
                  }}
                  className="rounded p-2 hover:bg-secondary"
                  aria-label="Save"
                >
                  <Save className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="rounded p-2 hover:bg-secondary"
                  aria-label="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm">{c}</span>
                <button
                  onClick={() => {
                    setEditing(c);
                    setDraft(c);
                  }}
                  className="rounded p-2 hover:bg-secondary"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeCategory(c)}
                  className="rounded p-2 text-destructive hover:bg-secondary"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AllVideosManager() {
  const videos = useVideos();
  const categories = useCategories();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">All videos ({videos.length})</h2>
      {videos.length === 0 && (
        <p className="text-sm text-muted-foreground">No videos uploaded yet.</p>
      )}
      <ul className="space-y-3">
        {videos.map((v) =>
          editingId === v.id ? (
            <EditVideoRow
              key={v.id}
              video={v}
              categories={categories}
              onClose={() => setEditingId(null)}
            />
          ) : (
            <li
              key={v.id}
              className="flex items-center gap-3 rounded-md border border-border bg-background/40 p-3"
            >
              <div className="h-14 w-24 shrink-0 overflow-hidden rounded-md bg-secondary">
                {v.thumbnail ? (
                  <img src={v.thumbnail} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{
                      background: `linear-gradient(135deg, oklch(0.35 0.15 ${v.hue}), oklch(0.12 0.05 ${(v.hue + 60) % 360}))`,
                    }}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{v.title}</p>
                <p className="text-xs text-muted-foreground">{v.category}</p>
              </div>
              <button
                onClick={() => setEditingId(v.id)}
                className="rounded p-2 hover:bg-secondary"
                aria-label="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete "${v.title}"?`)) deleteVideo(v.id);
                }}
                className="rounded p-2 text-destructive hover:bg-secondary"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

function EditVideoRow({
  video,
  categories,
  onClose,
}: {
  video: VideoItem;
  categories: string[];
  onClose: () => void;
}) {
  const [title, setTitle] = useState(video.title);
  const [category, setCategory] = useState(video.category);
  const [thumb, setThumb] = useState<string | null>(video.thumbnail);

  return (
    <li className="space-y-3 rounded-md border border-primary bg-background/60 p-4">
      <Field label="Title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Category">
        <input
          list="edit-categories"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClass}
        />
        <datalist id="edit-categories">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Field>
      <Field label="Thumbnail">
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) setThumb(await resizeImageToDataUrl(f));
          }}
          className={fileInputClass}
        />
        {thumb && (
          <img src={thumb} alt="" className="mt-2 h-24 w-40 rounded-md object-cover" />
        )}
      </Field>
      <div className="flex gap-2">
        <button
          onClick={() => {
            updateVideo(video.id, {
              title: title.trim() || video.title,
              category: category.trim() || video.category,
              thumbnail: thumb,
            });
            onClose();
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Save className="h-4 w-4" /> Save
        </button>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-4 py-2 text-sm hover:bg-muted"
        >
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>
    </li>
  );
}

function Field({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "h-10 w-full rounded-md border border-border bg-input px-3 text-sm outline-none focus:border-primary";
const fileInputClass =
  "block w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-primary-foreground";