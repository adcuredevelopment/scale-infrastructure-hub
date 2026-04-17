import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { AdminFontLoader } from "@/components/admin/AdminFontLoader";
import "@/styles/admin.css";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const attemptsRef = useRef(0);
  const lockoutUntilRef = useRef(0);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const now = Date.now();
    if (now < lockoutUntilRef.current) {
      const remaining = Math.ceil((lockoutUntilRef.current - now) / 1000);
      setError(`Too many attempts. Try again in ${remaining}s.`);
      return;
    }

    setLoading(true);

    const { error } = await signIn(email.trim(), password);
    if (error) {
      attemptsRef.current += 1;
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        lockoutUntilRef.current = Date.now() + LOCKOUT_MS;
        attemptsRef.current = 0;
        setError(`Too many failed attempts. Locked out for 60 seconds.`);
      } else {
        setError(error);
      }
      setLoading(false);
      return;
    }

    attemptsRef.current = 0;
    navigate("/admin");
  };

  const hasError = !!error;

  return (
    <div className="admin-scope min-h-screen flex items-center justify-center px-4">
      <AdminFontLoader />

      <div
        className="w-full max-w-[400px] p-10 admin-page"
        style={{
          background: "var(--ad-surface)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-8">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center font-syne font-bold text-[14px]"
            style={{
              background: "linear-gradient(135deg, var(--ad-accent), #1d4ed8)",
              color: "#fff",
            }}
          >
            A
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-syne font-bold text-[20px]" style={{ color: "var(--ad-text)" }}>
              Adcure
            </span>
            <span
              className="text-[10px] uppercase mt-1"
              style={{ color: "var(--ad-text-faint)", letterSpacing: "0.1em" }}
            >
              Admin
            </span>
          </div>
        </div>

        {/* Title */}
        <h1
          className="font-syne font-semibold text-[18px] mb-1"
          style={{ color: "var(--ad-text)" }}
        >
          Sign in to your account
        </h1>
        <p className="text-[13px] mb-7" style={{ color: "var(--ad-text-secondary)" }}>
          Enter your credentials to access the admin panel.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-[11px] uppercase font-medium"
              style={{ color: "var(--ad-text-faint)", letterSpacing: "0.08em" }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@adcure.agency"
              required
              autoComplete="email"
              className="admin-input w-full h-10 px-3 text-[13px]"
              style={hasError ? { borderColor: "var(--ad-red-border)" } : undefined}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-[11px] uppercase font-medium"
              style={{ color: "var(--ad-text-faint)", letterSpacing: "0.08em" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="admin-input w-full h-10 px-3 text-[13px]"
              style={hasError ? { borderColor: "var(--ad-red-border)" } : undefined}
            />
          </div>

          {error && (
            <p
              className="text-[12px] rounded-md px-3 py-2"
              style={{
                background: "var(--ad-red-soft)",
                color: "var(--ad-red-text)",
                border: "1px solid var(--ad-red-border)",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="admin-btn-primary w-full h-10 text-[13px] inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Sign in
          </button>
        </form>

        <p
          className="text-[11px] text-center mt-8"
          style={{ color: "var(--ad-text-muted)" }}
        >
          service@adcure.agency
        </p>
      </div>
    </div>
  );
}
