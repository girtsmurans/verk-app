import { getCurrentUser, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import Link from "next/link";

export default async function ExportPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "manager") redirect("/");

  const supabase = await createClient();
  const { data: employees } = await supabase
    .from("users")
    .select("id, first_name, last_name")
    .eq("role", "employee")
    .order("first_name");

  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  const defaultFrom = firstOfMonth.toISOString().slice(0, 10);
  const defaultTo = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <TopNav name={`${user.first_name} ${user.last_name}`} roleLabel="Vadītājs" />
      <main className="mx-auto max-w-md px-4 py-6 sm:px-6">
        <Link href="/manager" className="mb-4 inline-block text-sm text-neutral-500 hover:text-neutral-900">
          ← Atpakaļ uz uzdevumiem
        </Link>
        <h1 className="mb-4 text-xl font-semibold">Stundu eksports</h1>

        <form action="/api/export" method="GET" className="card flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Darbinieks</label>
            <select name="employee_id" className="input" defaultValue="all">
              <option value="all">Visi darbinieki</option>
              {employees?.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.first_name} {e.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">No</label>
              <input type="date" name="from" defaultValue={defaultFrom} className="input" />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Līdz</label>
              <input type="date" name="to" defaultValue={defaultTo} className="input" />
            </div>
          </div>
          <button type="submit" className="btn-primary">
            Lejupielādēt CSV (atveras Excel/Sheets)
          </button>
        </form>
      </main>
    </div>
  );
}
