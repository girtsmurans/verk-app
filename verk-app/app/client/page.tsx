import { getCurrentUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { ClientTaskForm } from "./ClientTaskForm";
import { ClientTaskList } from "./ClientTaskList";

export default async function ClientPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "client") redirect("/");

  return (
    <div>
      <TopNav
        name={`${user.first_name} ${user.last_name}`}
        roleLabel="Klients"
      />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <h1 className="mb-4 text-xl font-semibold">Jauns uzdevums</h1>
        <ClientTaskForm clientId={user.id} />

        <h2 className="mb-3 mt-10 text-xl font-semibold">Mani uzdevumi</h2>
        <ClientTaskList clientId={user.id} />
      </main>
    </div>
  );
}
