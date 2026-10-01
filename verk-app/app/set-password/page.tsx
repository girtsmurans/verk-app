"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      setError("Neizdevās saglabāt paroli. Mēģini vēlreiz.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold">Sveicināts Verk!</h1>
        <p className="mb-6 text-sm text-neutral-500">
          Iestati savu paroli, lai pabeigtu reģistrāciju
        </p>

        <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Jaunā parole
            </label>
            <input
              type="password"
              required
              minLength={8}
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Saglabā..." : "Saglabāt un turpināt"}
          </button>
        </form>
      </div>
    </div>
  );
}
