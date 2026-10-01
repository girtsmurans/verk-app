import { createClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/StatusBadge";

export async function ClientTaskList({ clientId }: { clientId: string }) {
  const supabase = await createClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, description, address_text, status, created_at, task_photos(photo_url)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (!tasks || tasks.length === 0) {
    return <p className="text-sm text-neutral-400">Vēl nav iesniegtu uzdevumu.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <div key={task.id} className="card">
          <div className="mb-1 flex items-start justify-between gap-2">
            <p className="font-medium">{task.description}</p>
            <StatusBadge status={task.status} />
          </div>
          {task.address_text && (
            <p className="text-sm text-neutral-500">{task.address_text}</p>
          )}
          {task.task_photos && task.task_photos.length > 0 && (
            <div className="mt-2 flex gap-2">
              {task.task_photos.map((p: { photo_url: string }, i: number) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={p.photo_url}
                  alt="Pabeigtā darba foto"
                  className="h-16 w-16 rounded object-cover"
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
