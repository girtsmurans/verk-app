import { getCurrentUser } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { StatusBadge, UrgentBadge } from "@/components/StatusBadge";
import { AssignEmployeeForm } from "./AssignEmployeeForm";
import { DeleteTaskButton } from "./DeleteTaskButton";
import { TaskCreateForm } from "@/components/TaskCreateForm";
import Link from "next/link";

export default async function ManagerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "manager") redirect("/");

  const supabase = await createClient();

  const { data: tasks } = await supabase
    .from("tasks")
    .select(
      "id, description, address_text, status, is_urgent, deadline, created_at, users!tasks_client_id_fkey(first_name, last_name, company), task_assignees(users(id, first_name, last_name))"
    )
    .order("created_at", { ascending: false });

  const { data: employees } = await supabase
    .from("users")
    .select("id, first_name, last_name")
    .eq("role", "employee");

  const { data: clients } = await supabase
    .from("users")
    .select("id, first_name, last_name")
    .eq("role", "client");

  return (
    <div>
      <TopNav
        name={`${user.first_name} ${user.last_name}`}
        roleLabel="Vadītājs"
      />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Uzdevumi</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/manager/employees" className="text-neutral-500 hover:text-neutral-900">
              Darbinieki
            </Link>
            <Link href="/manager/calendar" className="text-neutral-500 hover:text-neutral-900">
              Kalendārs
            </Link>
            <Link href="/manager/export" className="text-neutral-500 hover:text-neutral-900">
              Eksports
            </Link>
          </div>
        </div>

        <details className="mb-6">
          <summary className="cursor-pointer text-sm font-medium text-neutral-600">
            + Izveidot jaunu uzdevumu
          </summary>
          <div className="mt-3">
            <TaskCreateForm
              creatorId={user.id}
              clients={clients ?? []}
              employees={employees ?? []}
            />
          </div>
        </details>

        <div className="flex flex-col gap-3">
          {tasks?.map((task) => (
            <div key={task.id} className="card">
              <div className="mb-1 flex items-start justify-between gap-2">
                <p className="font-medium">{task.description}</p>
                <div className="flex items-center gap-2">
                  {task.is_urgent && <UrgentBadge />}
                  <StatusBadge status={task.status} />
                  <DeleteTaskButton taskId={task.id} />
                </div>
              </div>
              {task.address_text && (
                <p className="text-sm text-neutral-500">{task.address_text}</p>
              )}
              {task.deadline && (
                <p className="text-xs text-neutral-400">
                  Termiņš: {task.deadline}
                </p>
              )}
              <p className="mt-1 text-xs text-neutral-400">
                Klients:{" "}
                {(task.users as unknown as { first_name: string; last_name: string; company: string } | null)
                  ? `${(task.users as unknown as { first_name: string; last_name: string })?.first_name} ${(task.users as unknown as { last_name: string })?.last_name}`
                  : "—"}
              </p>

              <AssignEmployeeForm
                taskId={task.id}
                employees={employees ?? []}
                currentlyAssigned={
                  (task.task_assignees as unknown as { users: { id: string; first_name: string; last_name: string } }[]) ?? []
                }
              />
            </div>
          ))}
          {(!tasks || tasks.length === 0) && (
            <p className="text-sm text-neutral-400">Vēl nav neviena uzdevuma.</p>
          )}
        </div>
      </main>
    </div>
  );
}
