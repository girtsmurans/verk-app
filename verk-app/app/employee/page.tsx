import { getCurrentUser, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { CheckInOut } from "./CheckInOut";
import { EmployeeTaskList } from "./EmployeeTaskList";
import { TaskCreateForm } from "@/components/TaskCreateForm";

export default async function EmployeePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "employee") redirect("/");

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: todayEntry } = await supabase
    .from("time_entries")
    .select("*")
    .eq("employee_id", user.id)
    .eq("work_date", today)
    .maybeSingle();

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
        roleLabel="Darbinieks"
      />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <CheckInOut employeeId={user.id} entry={todayEntry} />

        <details className="mt-8">
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

        <h2 className="mb-3 mt-10 text-lg font-semibold">Man piešķirtie uzdevumi</h2>
        <EmployeeTaskList employeeId={user.id} onlyAssigned />

        <h2 className="mb-3 mt-10 text-lg font-semibold">Visi uzdevumi</h2>
        <EmployeeTaskList employeeId={user.id} onlyAssigned={false} />
      </main>
    </div>
  );
}
