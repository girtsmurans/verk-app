import { getCurrentUser, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "manager") redirect("/");

  const { date } = await searchParams;
  const selectedDate = date || new Date().toISOString().slice(0, 10);

  const supabase = await createClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, description, status, completed_at, deadline, task_assignees(users(first_name, last_name))")
    .or(`deadline.eq.${selectedDate},completed_at.gte.${selectedDate}T00:00:00,completed_at.lte.${selectedDate}T23:59:59`);

  return (
    <div>
      <TopNav name={`${user.first_name} ${user.last_name}`} roleLabel="Vadītājs" />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <Link href="/manager" className="mb-4 inline-block text-sm text-neutral-500 hover:text-neutral-900">
          ← Atpakaļ uz uzdevumiem
        </Link>
        <h1 className="mb-4 text-xl font-semibold">Kalendārs</h1>

        <form className="card mb-4 flex items-center gap-2">
          <label className="text-sm">Datums:</label>
          <input type="date" name="date" defaultValue={selectedDate} className="input w-auto" />
          <button type="submit" className="btn-primary">Rādīt</button>
        </form>

        <div className="flex flex-col gap-3">
          {tasks?.map((task) => (
            <div key={task.id} className="card">
              <div className="mb-1 flex items-start justify-between gap-2">
                <p className="font-medium">{task.description}</p>
                <StatusBadge status={task.status} />
              </div>
              {task.task_assignees && task.task_assignees.length > 0 && (
                <p className="text-xs text-neutral-400">
                  {(task.task_assignees as unknown as { users: { first_name: string; last_name: string } }[])
                    .map((a) => `${a.users?.first_name} ${a.users?.last_name}`)
                    .join(", ")}
                </p>
              )}
            </div>
          ))}
          {(!tasks || tasks.length === 0) && (
            <p className="text-sm text-neutral-400">Šajā datumā nav uzdevumu.</p>
          )}
        </div>
      </main>
    </div>
  );
}
