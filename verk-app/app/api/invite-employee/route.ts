import { getCurrentUser } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "manager") {
    return NextResponse.json({ error: "Nav atļaujas." }, { status: 403 });
  }

  const { email, firstName, lastName, company } = await request.json();
  if (!email) {
    return NextResponse.json({ error: "E-pasts obligāts." }, { status: 400 });
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { role: "employee", first_name: firstName, last_name: lastName, company },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, userId: data.user?.id });
}
