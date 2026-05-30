import { useEffect, useState } from "react";
import { deleteBlob, getBlob } from "./blobs";

export type VideoSource =
  | { kind: "link"; url: string }
  | { kind: "file"; blobId: string; filename: string; mimeType: string };

export type VideoItem = {
  id: string;
  title: string;
  category: string;
  thumbnail: string | null;
  source: VideoSource;
  hue: number;
  createdAt: number;
};

export type User = {
  id: string;
  email: string;
  password: string; // demo only — plaintext in localStorage
  isAdmin: boolean;
};

const VIDEOS_KEY = "desileaks.videos.v2";
const CATEGORIES_KEY = "desileaks.categories.v1";
const USERS_KEY = "desileaks.users.v1";
const SESSION_KEY = "desileaks.session.v1";

const DEFAULT_CATEGORIES = [
  "Trending",
  "Travel",
  "Food",
  "Nature",
  "Music",
  "Sports",
  "Comedy",
  "Dance",
];

const EVT = "desileaks:change";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(EVT));
}

export function getVideos(): VideoItem[] {
  const raw = read<VideoItem[]>(VIDEOS_KEY, []);
  // Drop legacy entries that used the old { kind: "file", dataUrl } shape.
  return raw.filter((v) => {
    if (!v || !v.source) return false;
    if (v.source.kind === "link") return typeof v.source.url === "string";
    if (v.source.kind === "file") return typeof (v.source as { blobId?: string }).blobId === "string";
    return false;
  });
}
export function setVideos(list: VideoItem[]) {
  write(VIDEOS_KEY, list);
}
export function addVideo(v: VideoItem) {
  setVideos([v, ...getVideos()]);
}
export function updateVideo(id: string, patch: Partial<VideoItem>) {
  setVideos(getVideos().map((v) => (v.id === id ? { ...v, ...patch } : v)));
}
export function deleteVideo(id: string) {
  const target = getVideos().find((v) => v.id === id);
  if (target && target.source.kind === "file") {
    deleteBlob(target.source.blobId).catch(() => undefined);
  }
  setVideos(getVideos().filter((v) => v.id !== id));
}

export function getCategories(): string[] {
  const list = read<string[] | null>(CATEGORIES_KEY, null);
  if (!list) {
    write(CATEGORIES_KEY, DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
  return list;
}
export function setCategories(list: string[]) {
  write(CATEGORIES_KEY, list);
}
export function addCategory(name: string) {
  const n = name.trim();
  if (!n) return;
  const list = getCategories();
  if (list.some((c) => c.toLowerCase() === n.toLowerCase())) return;
  setCategories([...list, n]);
}
export function renameCategory(oldName: string, newName: string) {
  const n = newName.trim();
  if (!n) return;
  setCategories(getCategories().map((c) => (c === oldName ? n : c)));
  setVideos(getVideos().map((v) => (v.category === oldName ? { ...v, category: n } : v)));
}
export function removeCategory(name: string) {
  setCategories(getCategories().filter((c) => c !== name));
}

export function getUsers(): User[] {
  return read<User[]>(USERS_KEY, []);
}
function setUsers(list: User[]) {
  write(USERS_KEY, list);
}
export function getSession(): User | null {
  const id = read<string | null>(SESSION_KEY, null);
  if (!id) return null;
  return getUsers().find((u) => u.id === id) ?? null;
}
function setSession(id: string | null) {
  if (id) write(SESSION_KEY, id);
  else {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new CustomEvent(EVT));
  }
}
export function signup(email: string, password: string): User {
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("Email already registered");
  }
  const user: User = {
    id: crypto.randomUUID(),
    email,
    password,
    isAdmin: users.length === 0, // first user is admin
  };
  setUsers([...users, user]);
  setSession(user.id);
  return user;
}
export function login(email: string, password: string): User {
  const user = getUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  );
  if (!user) throw new Error("Invalid email or password");
  setSession(user.id);
  return user;
}
export function logout() {
  setSession(null);
}

function useStore<T>(getter: () => T): T {
  const [value, setValue] = useState<T>(getter);
  useEffect(() => {
    setValue(getter());
    const handler = () => setValue(getter());
    window.addEventListener(EVT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVT, handler);
      window.removeEventListener("storage", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}

export const useVideos = () => useStore(getVideos);
export const useCategories = () => useStore(getCategories);
export const useSession = () => useStore(getSession);

export function readAsDataUrl(f: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(f);
  });
}

// Resolve a playable URL for a video. Link sources return immediately; file
// sources lazily pull the Blob from IndexedDB and wrap it in an object URL.
export async function resolveVideoUrl(v: VideoItem): Promise<string | null> {
  if (v.source.kind === "link") return v.source.url;
  const blob = await getBlob(v.source.blobId);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}