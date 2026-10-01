import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "manager") redirect("/manager");
  if (user.role === "employee") redirect("/employee");
  redirect("/client");
}
