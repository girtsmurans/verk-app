"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Entry = {
  id: string;
  check_in_time: string;
  check_out_time: string | null;
  edited: boolean;
} | null;

function getLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null)
    );
  });
}

export function CheckInOut({
  employeeId,
  entry,
}: {
  employeeId: string;
  entry: Entry;
}) {
  const [loading, setLoading] = useState(false);
  const [editingCheckout, setEditingCheckout] = useState(false);
  const [manualTime, setManualTime] = useState("");
  const router = useRouter();

  async function handleCheckIn() {
    setLoading(true);
    const loc = await getLocation();
    const supabase = createClient();
    const today = new Date().toISOString().slice(0, 10);

    await supabase.from("time_entries").insert({
      employee_id: employeeId,
      work_date: today,
      check_in_time: new Date().toISOString(),
      check_in_lat: loc?.lat ?? null,
      check_in_lng: loc?.lng ?? null,
    });

    setLoading(false);
    router.refresh();
  }

  async function handleCheckOut() {
    if (!entry) return;
    setLoading(true);
    const loc = await getLocation();
    const supabase = createClient();

    await supabase
      .from("time_entries")
      .update({
        check_out_time: new Date().toISOString(),
        check_out_lat: loc?.lat ?? null,
        check_out_lng: loc?.lng ?? null,
      })
      .eq("id", entry.id);

    setLoading(false);
    router.refresh();
  }

  async function handleEditCheckout() {
    if (!entry || !manualTime) return;
    setLoading(true);
    const supabase = createClient();

    const oldTime = entry.check_out_time;
    const newTimeIso = new Date(
      `${new Date().toISOString().slice(0, 10)}T${manualTime}:00`
    ).toISOString();

    await supabase
      .from("time_entries")
      .update({ check_out_time: newTimeIso, edited: true })
      .eq("id", entry.id);

    await supabase.from("time_entry_audit").insert({
      time_entry_id: entry.id,
      edited_by: employeeId,
      old_check_out_time: oldTime,
      new_check_out_time: newTimeIso,
    });

    setLoading(false);
    setEditingCheckout(false);
    router.refresh();
  }

  return (
    <div className="card">
      <h2 className="mb-3 text-lg font-semibold">Šodienas darba laiks</h2>

      {!entry && (
        <button onClick={handleCheckIn} disabled={loading} className="btn-primary">
          {loading ? "..." : "Check in"}
        </button>
      )}

      {entry && !entry.check_out_time && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-neutral-500">
            Sākums: {new Date(entry.check_in_time).toLocaleTimeString("lv-LV", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <button onClick={handleCheckOut} disabled={loading} className="btn-primary">
            {loading ? "..." : "Check out"}
          </button>
        </div>
      )}

      {entry && entry.check_out_time && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-neutral-500">
            {new Date(entry.check_in_time).toLocaleTimeString("lv-LV", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            —{" "}
            {new Date(entry.check_out_time).toLocaleTimeString("lv-LV", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {entry.edited && (
              <span className="ml-2 text-xs text-neutral-400">(labots)</span>
            )}
          </p>

          {!editingCheckout ? (
            <button
              onClick={() => setEditingCheckout(true)}
              className="w-fit text-sm text-neutral-500 hover:text-neutral-900"
            >
              Labot check-out laiku
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="time"
                className="input w-auto"
                value={manualTime}
                onChange={(e) => setManualTime(e.target.value)}
              />
              <button
                onClick={handleEditCheckout}
                disabled={loading}
                className="btn-primary"
              >
                Saglabāt
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
