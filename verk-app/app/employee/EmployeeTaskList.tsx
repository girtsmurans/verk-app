import { createClient } from "@/lib/supabase/server";
import { StatusBadge, UrgentBadge } from "@/components/StatusBadge";
import { CompleteTaskButton } from "./CompleteTaskButton";

export async function EmployeeTaskList({
  employeeId,
  onlyAssigned,
}: {
  employeeId: string;
  onlyAssigned: boolean;
}) {
  const supabase = await createClient();

  let taskIds: string[] | null = null;
  if (onlyAssigned) {
    const { data: assignments } = await supabase
      .from("task_assignees")
      .select("task_id")
      .eq("employee_id", employeeId);
    taskIds = (assignments ?? []).map((a) => a.task_id);
    if (taskIds.length === 0) {
      return <p className="text-sm text-neutral-400">Nav piešķirtu uzdevumu.</p>;
    }
  }

  let query = supabase
    .from("tasks")
    .select("id, description, address_text, status, is_urgent, deadline")
    .neq("status", "completed")
    .order("created_at", { ascending: false });

  if (taskIds) query = query.in("id", taskIds);

  const { data: tasks } = await query;

  if (!tasks || tasks.length === 0) {
    return <p className="text-sm text-neutral-400">Nav aktīvu uzdevumu.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <div key={task.id} className="card">
          <div className="mb-1 flex items-start justify-between gap-2">
            <p className="font-medium">{task.description}</p>
            <div className="flex gap-2">
              {task.is_urgent && <UrgentBadge />}
              <StatusBadge status={task.status} />
            </div>
          </div>
          {task.address_text && (
            <p className="text-sm text-neutral-500">{task.address_text}</p>
          )}
          {task.deadline && (
            <p className="text-xs text-neutral-400">Termiņš: {task.deadline}</p>
          )}
          <CompleteTaskButton taskId={task.id} employeeId={employeeId} />
        </div>
      ))}
    </div>
  );
}
