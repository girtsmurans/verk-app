"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Employee = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string | null;
};

export function EmployeeRow({ employee }: { employee: Employee }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Vai tiešām dzēst ${employee.first_name} ${employee.last_name}?`)) {
      return;
    }
    setLoading(true);
    const supabase = createClient();
    // Deletes the profile row; the auth account can be removed separately if needed.
    await supabase.from("users").delete().eq("id", employee.id);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="card flex items-center justify-between">
      <div>
        <p className="font-medium">
          {employee.first_name} {employee.last_name}
        </p>
        <p className="text-xs text-neutral-400">
          {employee.email}
          {employee.company ? ` · ${employee.company}` : ""}
        </p>
      </div>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-sm text-red-500 hover:text-red-700"
      >
        Dzēst
      </button>
    </div>
  );
}
