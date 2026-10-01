"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function CompleteTaskButton({
  taskId,
  employeeId,
}: {
  taskId: string;
  employeeId: string;
}) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleComplete() {
    setLoading(true);
    const supabase = createClient();

    const file = fileInputRef.current?.files?.[0];
    if (file) {
      const path = `${taskId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("task-photos")
        .upload(path, file);

      if (!uploadError) {
        const { data: pub } = supabase.storage
          .from("task-photos")
          .getPublicUrl(path);

        await supabase.from("task_photos").insert({
          task_id: taskId,
          photo_url: pub.publicUrl,
          uploaded_by: employeeId,
        });
      }
    }

    await supabase
      .from("tasks")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", taskId);

    setLoading(false);
    router.refresh();
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        className="text-xs"
      />
      <button onClick={handleComplete} disabled={loading} className="btn-primary">
        {loading ? "..." : "Atzīmēt kā izpildītu"}
      </button>
    </div>
  );
}
