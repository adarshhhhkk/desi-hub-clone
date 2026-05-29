import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { useVideos, videoPlaybackUrl, type VideoItem } from "@/lib/store";
import { Thumb } from "./index";

export const Route = createFileRoute("/watch/$id")({
  component: WatchPage,
});

function WatchPage() {
  const { id } = Route.useParams();
  const videos = useVideos();
  const video = videos.find((v) => v.id === id);

  if (!video) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="text-xl font-bold">Video not found</h1>
          <Link to="/" className="mt-3 inline-block text-sm text-primary hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  const suggestions = videos.filter((v) => v.id !== video.id).slice(0, 20);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          <Player video={video} />
          <h1 className="mt-4 text-xl font-bold leading-snug">{video.title}</h1>
          <span className="mt-2 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            {video.category}
          </span>

          {/* Mobile suggestions (below player) */}
          <div className="mt-8 lg:hidden">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Up next
            </h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-5">
              {suggestions.map((v) => (
                <SuggestionCard key={v.id} v={v} variant="grid" />
              ))}
            </div>
          </div>
        </div>

        {/* Desktop sidebar suggestions */}
        <aside className="hidden lg:block">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Up next
          </h2>
          <div className="space-y-3">
            {suggestions.map((v) => (
              <SuggestionCard key={v.id} v={v} variant="row" />
            ))}
          </div>
        </aside>

        {/* Below-player suggestions on desktop too */}
        <div className="hidden lg:col-span-2 lg:block">
          <h2 className="mb-3 mt-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            More to watch
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 xl:grid-cols-4">
            {suggestions.map((v) => (
              <SuggestionCard key={`g-${v.id}`} v={v} variant="grid" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Player({ video }: { video: VideoItem }) {
  const url = videoPlaybackUrl(video);
  const isYoutube = /youtu\.?be/.test(url);
  const isVimeo = /vimeo\.com/.test(url);

  if (isYoutube) {
    const id = extractYouTubeId(url);
    if (id) {
      return (
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${id}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
            title={video.title}
          />
        </div>
      );
    }
  }
  if (isVimeo) {
    const id = url.split("/").pop()?.split("?")[0];
    if (id) {
      return (
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
          <iframe
            src={`https://player.vimeo.com/video/${id}`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
            title={video.title}
          />
        </div>
      );
    }
  }

  return (
    <video
      controls
      autoPlay
      poster={video.thumbnail ?? undefined}
      src={url}
      className="aspect-video w-full rounded-lg bg-black"
    />
  );
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/,
  );
  return m ? m[1] : null;
}

function SuggestionCard({ v, variant }: { v: VideoItem; variant: "row" | "grid" }) {
  if (variant === "row") {
    return (
      <Link to="/watch/$id" params={{ id: v.id }} className="group flex gap-3">
        <div className="w-40 shrink-0">
          <Thumb v={v} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
            {v.title}
          </h3>
          <span className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
            {v.category}
          </span>
        </div>
      </Link>
    );
  }
  return (
    <Link to="/watch/$id" params={{ id: v.id }} className="group block">
      <Thumb v={v} />
      <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">
        {v.title}
      </h3>
      <span className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
        {v.category}
      </span>
    </Link>
  );
}