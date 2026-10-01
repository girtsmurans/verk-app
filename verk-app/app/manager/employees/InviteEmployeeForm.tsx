"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function InviteEmployeeForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const res = await fetch("/api/invite-employee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, firstName, lastName, company }),
    });

    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Neizdevās uzaicināt darbinieku.");
      return;
    }

    setEmail("");
    setFirstName("");
    setLastName("");
    setCompany("");
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          required
          placeholder="Vārds"
          className="input"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          required
          placeholder="Uzvārds"
          className="input"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <input
        placeholder="Uzņēmums (ja apakšuzņēmuma darbinieks)"
        className="input"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      <input
        type="email"
        required
        placeholder="E-pasts"
        className="input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Ielūgums nosūtīts!</p>}
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Sūta..." : "Nosūtīt ielūgumu"}
      </button>
    </form>
  );
}
