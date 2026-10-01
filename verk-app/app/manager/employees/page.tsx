import { getCurrentUser, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import Link from "next/link";
import { InviteEmployeeForm } from "./InviteEmployeeForm";
import { EmployeeRow } from "./EmployeeRow";

export default async function EmployeesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "manager") redirect("/");

  const supabase = await createClient();
  const { data: employees } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, company")
    .eq("role", "employee")
    .order("first_name");

  return (
    <div>
      <TopNav name={`${user.first_name} ${user.last_name}`} roleLabel="Vadītājs" />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <Link href="/manager" className="mb-4 inline-block text-sm text-neutral-500 hover:text-neutral-900">
          ← Atpakaļ uz uzdevumiem
        </Link>
        <h1 className="mb-4 text-xl font-semibold">Uzaicināt darbinieku</h1>
        <InviteEmployeeForm />

        <h2 className="mb-3 mt-10 text-xl font-semibold">Darbinieki</h2>
        <div className="flex flex-col gap-2">
          {employees?.map((emp) => (
            <EmployeeRow key={emp.id} employee={emp} />
          ))}
          {(!employees || employees.length === 0) && (
            <p className="text-sm text-neutral-400">Vēl nav darbinieku.</p>
          )}
        </div>
      </main>
    </div>
  );
}
