"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DeleteTaskButton({ taskId }: { taskId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Vai tiešām dzēst šo uzdevumu?")) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("tasks").delete().eq("id", taskId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-500 hover:text-red-700"
    >
      Dzēst
    </button>
  );
}
