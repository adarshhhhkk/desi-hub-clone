import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// ----- Types -----

export type VideoItem = {
  id: string;
  title: string;
  category: string;
  thumbnail: string | null; // public URL
  source_kind: "link" | "file";
  source_url: string; // playable URL (external link, or public storage URL)
  storage_path: string | null; // path inside the videos bucket (for admin delete/download)
  mime_type: string | null;
  hue: number;
  created_at: string;
};

export type SessionUser = {
  id: string;
  email: string;
  isAdmin: boolean;
};

const REFRESH_EVT = "desileaks:refresh";
const fireRefresh = () => window.dispatchEvent(new CustomEvent(REFRESH_EVT));

// ----- Session / admin status -----

export function useSession(): SessionUser | null {
  const [user, setUser] = useState<SessionUser | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setUser(null);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin, email")
      .eq("id", data.user.id)
      .maybeSingle();
    setUser({
      id: data.user.id,
      email: profile?.email ?? data.user.email ?? "",
      isAdmin: !!profile?.is_admin,
    });
  }, []);

  useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load();
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  return user;
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function signup(email: string, password: string) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${window.location.origin}/` },
  });
  if (error) throw error;
}

export async function login(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

// ----- Videos -----

export function useVideos(): VideoItem[] {
  const [videos, setVideos] = useState<VideoItem[]>([]);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setVideos(
        data.map((row) => ({
          id: row.id,
          title: row.title,
          category: row.category,
          thumbnail: row.thumbnail_url,
          source_kind: row.source_kind as "link" | "file",
          source_url: row.source_url ?? "",
          storage_path: row.storage_path,
          mime_type: row.mime_type,
          hue: row.hue ?? 0,
          created_at: row.created_at,
        })),
      );
    }
  }, []);

  useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener(REFRESH_EVT, onRefresh);
    return () => window.removeEventListener(REFRESH_EVT, onRefresh);
  }, [load]);

  return videos;
}

export async function addVideo(input: {
  title: string;
  category: string;
  thumbnail_url: string | null;
  source_kind: "link" | "file";
  source_url: string;
  storage_path: string | null;
  mime_type: string | null;
  hue: number;
}) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from("videos").insert({
    title: input.title,
    category: input.category,
    thumbnail_url: input.thumbnail_url,
    source_kind: input.source_kind,
    source_url: input.source_url,
    storage_path: input.storage_path,
    mime_type: input.mime_type,
    hue: input.hue,
    created_by: userData.user?.id ?? null,
  });
  if (error) throw error;
  fireRefresh();
}

export async function updateVideo(
  id: string,
  patch: { title?: string; category?: string; thumbnail_url?: string | null },
) {
  const { error } = await supabase.from("videos").update(patch).eq("id", id);
  if (error) throw error;
  fireRefresh();
}

export async function deleteVideo(id: string) {
  const { data: row } = await supabase
    .from("videos")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (row?.storage_path) {
    await supabase.storage.from("videos").remove([row.storage_path]);
  }
  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) throw error;
  fireRefresh();
}

// ----- Categories -----

export function useCategories(): string[] {
  const [cats, setCats] = useState<string[]>([]);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("name")
      .order("name");
    if (!error && data) setCats(data.map((r) => r.name));
  }, []);

  useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener(REFRESH_EVT, onRefresh);
    return () => window.removeEventListener(REFRESH_EVT, onRefresh);
  }, [load]);

  return cats;
}

export async function addCategory(name: string) {
  const n = name.trim();
  if (!n) return;
  const { error } = await supabase
    .from("categories")
    .insert({ name: n });
  if (error && !error.message.toLowerCase().includes("duplicate")) throw error;
  fireRefresh();
}

export async function renameCategory(oldName: string, newName: string) {
  const n = newName.trim();
  if (!n || n === oldName) return;
  const { error } = await supabase
    .from("categories")
    .update({ name: n })
    .eq("name", oldName);
  if (error) throw error;
  // Cascade rename onto videos
  await supabase.from("videos").update({ category: n }).eq("category", oldName);
  fireRefresh();
}

export async function removeCategory(name: string) {
  const { error } = await supabase.from("categories").delete().eq("name", name);
  if (error) throw error;
  fireRefresh();
}

// ----- Storage helpers -----

export async function uploadVideoFile(file: File): Promise<{
  path: string;
  publicUrl: string;
}> {
  const ext = file.name.split(".").pop() ?? "mp4";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("videos")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("videos").getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export async function uploadThumbnail(blob: Blob, ext = "jpg"): Promise<string> {
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("thumbnails")
    .upload(path, blob, { contentType: blob.type || "image/jpeg", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("thumbnails").getPublicUrl(path);
  return data.publicUrl;
}

// Convert a data URL back to a Blob (so resized thumbs from the canvas can be uploaded).
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, b64] = dataUrl.split(",");
  const mime = /data:([^;]+);/.exec(header)?.[1] ?? "image/jpeg";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}