"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function TopNav({
  name,
  roleLabel,
}: {
  name: string;
  roleLabel: string;
}) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 sm:px-6">
      <div>
        <span className="font-semibold">Verk</span>
        <span className="ml-2 text-sm text-neutral-400">{roleLabel}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-600">{name}</span>
        <button
          onClick={handleLogout}
          className="text-sm text-neutral-500 hover:text-neutral-900"
        >
          Iziet
        </button>
      </div>
    </header>
  );
}
