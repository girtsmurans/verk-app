"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MapPicker } from "@/components/MapPicker";

type Person = { id: string; first_name: string; last_name: string };

export function TaskCreateForm({
  creatorId,
  clients,
  employees,
}: {
  creatorId: string;
  clients: Person[];
  employees: Person[];
}) {
  const [description, setDescription] = useState("");
  const [addressText, setAddressText] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [clientId, setClientId] = useState("");
  const [assignedEmployees, setAssignedEmployees] = useState<string[]>([]);
  const [deadline, setDeadline] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  function toggleEmployee(id: string) {
    setAssignedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const status = assignedEmployees.length > 0 ? "approved" : "new";

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        description,
        address_text: addressText || null,
        location_lat: location?.lat ?? null,
        location_lng: location?.lng ?? null,
        client_id: clientId || null,
        created_by: creatorId,
        deadline: deadline || null,
        is_urgent: isUrgent,
        status,
        approved_at: status === "approved" ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (error || !task) {
      setLoading(false);
      setError("Neizdevās izveidot uzdevumu.");
      return;
    }

    if (assignedEmployees.length > 0) {
      await supabase.from("task_assignees").insert(
        assignedEmployees.map((employee_id) => ({
          task_id: task.id,
          employee_id,
        }))
      );
    }

    setLoading(false);
    setDescription("");
    setAddressText("");
    setLocation(null);
    setClientId("");
    setAssignedEmployees([]);
    setDeadline("");
    setIsUrgent(false);
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
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Adrese</label>
        <input
          className="input"
          value={addressText}
          onChange={(e) => setAddressText(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Vieta kartē</label>
        <MapPicker onChange={(lat, lng) => setLocation({ lat, lng })} />
      </div>

      {clients.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium">
            Klients (nav obligāti)
          </label>
          <select
            className="input"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            <option value="">—</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">
          Piešķirt darbiniekiem (nav obligāti)
        </label>
        <div className="flex flex-wrap gap-2">
          {employees.map((emp) => (
            <label
              key={emp.id}
              className="flex items-center gap-1 rounded-full border border-neutral-200 px-2 py-1 text-xs"
            >
              <input
                type="checkbox"
                checked={assignedEmployees.includes(emp.id)}
                onChange={() => toggleEmployee(emp.id)}
              />
              {emp.first_name} {emp.last_name}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-neutral-500">
          Termiņš:{" "}
          <input
            type="date"
            className="input mt-1 inline-block w-auto"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-1 text-sm text-neutral-500">
          <input
            type="checkbox"
            checked={isUrgent}
            onChange={(e) => setIsUrgent(e.target.checked)}
          />
          Steidzami
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Uzdevums izveidots!</p>}

      <button type="submit" disabled={loading} className="btn-primary w-fit">
        {loading ? "Saglabā..." : "Izveidot uzdevumu"}
      </button>
    </form>
  );
}
