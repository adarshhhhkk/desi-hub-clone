import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Menu, LogIn, LogOut, LayoutDashboard, User } from "lucide-react";
import { useState } from "react";
import logoWoman from "@/assets/logo-woman.png";
import { login, logout, signup, useSession } from "@/lib/store";

type Props = {
  query?: string;
  onQueryChange?: (q: string) => void;
};

export function SiteHeader({ query, onQueryChange }: Props) {
  const session = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4">
        <button className="rounded p-2 hover:bg-secondary md:hidden" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <img src={logoWoman} alt="DESILEAKS" width={32} height={32} className="h-8 w-8 rounded object-contain" />
          <span className="text-lg font-bold tracking-tight">
            DESI<span className="text-primary">LEAKS</span>
          </span>
        </Link>

        {onQueryChange && (
          <div className="ml-4 hidden flex-1 max-w-xl md:block">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query ?? ""}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search by title or category…"
                className="h-9 w-full rounded-full border border-border bg-input pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1">
          {session?.isAdmin && (
            <Link
              to="/admin"
              className="hidden items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 sm:inline-flex"
            >
              <LayoutDashboard className="h-4 w-4" /> Admin
            </Link>
          )}
          {session ? (
            <button
              onClick={() => logout()}
              className="rounded p-2 hover:bg-secondary"
              aria-label="Logout"
              title={`Sign out ${session.email}`}
            >
              <LogOut className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="rounded p-2 hover:bg-secondary"
              aria-label="Login"
              title="Login"
            >
              <LogIn className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile search */}
      {onQueryChange && (
        <div className="border-t border-border px-4 py-2 md:hidden">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query ?? ""}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search…"
              className="h-9 w-full rounded-full border border-border bg-input pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
      )}

      {open && <AuthModal onClose={() => setOpen(false)} />}
    </header>
  );
}

function AuthModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    try {
      const user = mode === "login" ? login(email.trim(), pwd) : signup(email.trim(), pwd);
      onClose();
      if (user.isAdmin) navigate({ to: "/admin" });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold">
            {mode === "login" ? "Sign in" : "Create account"}
          </h2>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="h-10 w-full rounded-md border border-border bg-input px-3 text-sm outline-none focus:border-primary"
          />
          <input
            type="password"
            required
            minLength={4}
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="Password"
            className="h-10 w-full rounded-md border border-border bg-input px-3 text-sm outline-none focus:border-primary"
          />
          {err && <p className="text-xs text-destructive">{err}</p>}
          <button
            type="submit"
            className="h-10 w-full rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {mode === "login" ? "Sign in" : "Sign up"}
          </button>
        </form>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {mode === "login" ? "No account?" : "Already registered?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setErr("");
            }}
            className="font-semibold text-primary hover:underline"
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
        {mode === "signup" && (
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            The first account becomes the admin.
          </p>
        )}
      </div>
    </div>
  );
}