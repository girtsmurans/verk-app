"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MapPicker } from "@/components/MapPicker";

export function ClientTaskForm({ clientId }: { clientId: string }) {
  const [description, setDescription] = useState("");
  const [addressText, setAddressText] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const { error } = await supabase.from("tasks").insert({
      description,
      address_text: addressText || null,
      location_lat: location?.lat ?? null,
      location_lng: location?.lng ?? null,
      client_id: clientId,
      created_by: clientId,
      status: "new",
    });

    setLoading(false);
    if (error) {
      setError("Neizdevās nosūtīt uzdevumu. Mēģini vēlreiz.");
      return;
    }

    setDescription("");
    setAddressText("");
    setLocation(null);
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Apraksts</label>
        <textarea
          required
          className="input"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Piemēram: jānozāģē bīstams koks pagalmā"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Adrese (var arī ievadīt tekstā)
        </label>
        <input
          className="input"
          value={addressText}
          onChange={(e) => setAddressText(e.target.value)}
          placeholder="Iela, pilsēta"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Atzīmē vietu kartē
        </label>
        <MapPicker onChange={(lat, lng) => setLocation({ lat, lng })} />
        {location && (
          <p className="mt-1 text-xs text-neutral-400">
            Izvēlēts: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && (
        <p className="text-sm text-green-600">Uzdevums nosūtīts!</p>
      )}

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Sūta..." : "Iesniegt uzdevumu"}
      </button>
    </form>
  );
}
