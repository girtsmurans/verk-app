"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: "client",
          first_name: firstName,
          last_name: lastName,
          company,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError("Reģistrācija neizdevās. Pārbaudi datus un mēģini vēlreiz.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="card w-full max-w-sm text-center">
          <h1 className="mb-2 text-xl font-semibold">Paldies!</h1>
          <p className="text-sm text-neutral-500">
            Apstiprini savu e-pastu, izmantojot saņemto vēstuli, lai pabeigtu
            reģistrāciju.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold">Reģistrācija</h1>
        <p className="mb-6 text-sm text-neutral-500">Izveido klienta kontu</p>

        <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Vārds</label>
              <input
                required
                className="input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Uzvārds</label>
              <input
                required
                className="input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Uzņēmums</label>
            <input
              className="input"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">E-pasts</label>
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Parole</label>
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
            {loading ? "Reģistrējas..." : "Reģistrēties"}
          </button>
        </form>
      </div>
    </div>
  );
}
