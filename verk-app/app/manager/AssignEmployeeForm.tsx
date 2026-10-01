"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Employee = { id: string; first_name: string; last_name: string };

export function AssignEmployeeForm({
  taskId,
  employees,
  currentlyAssigned,
}: {
  taskId: string;
  employees: Employee[];
  currentlyAssigned: { users: Employee }[];
}) {
  const [query, setQuery] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const assignedIds = new Set(currentlyAssigned.map((a) => a.users?.id));

  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return employees
      .filter((e) => !assignedIds.has(e.id))
      .filter((e) =>
        `${e.first_name} ${e.last_name}`.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [query, employees, assignedIds]);

  async function assignEmployee(employeeId: string) {
    setSaving(true);
    const supabase = createClient();

    await supabase.from("task_assignees").insert({
      task_id: taskId,
      employee_id: employeeId,
    });

    const updates: Record<string, unknown> = { status: "approved" };
    if (deadline) {
      updates.deadline = deadline;
      updates.approved_at = new Date().toISOString();
    }
    if (isUrgent) updates.is_urgent = true;

    await supabase.from("tasks").update(updates).eq("id", taskId);

    setSaving(false);
    setQuery("");
    router.refresh();
  }

  return (
    <div className="mt-3 border-t border-neutral-100 pt-3">
      {currentlyAssigned.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {currentlyAssigned.map((a, i) => (
            <span
              key={i}
              className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
            >
              {a.users?.first_name} {a.users?.last_name}
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          className="input"
          placeholder="Meklēt darbinieku, lai piešķirtu..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {results.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-sm">
            {results.map((e) => (
              <button
                key={e.id}
                type="button"
                disabled={saving}
                onClick={() => assignEmployee(e.id)}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50"
              >
                {e.first_name} {e.last_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <label className="text-xs text-neutral-500">
          Termiņš:{" "}
          <input
            type="date"
            className="input mt-1 inline-block w-auto"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-1 text-xs text-neutral-500">
          <input
            type="checkbox"
            checked={isUrgent}
            onChange={(e) => setIsUrgent(e.target.checked)}
          />
          Steidzami
        </label>
      </div>
    </div>
  );
}
