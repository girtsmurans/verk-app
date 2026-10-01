import { getCurrentUser, createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function toCsvRow(fields: (string | number)[]) {
  return fields
    .map((f) => `"${String(f ?? "").replace(/"/g, '""')}"`)
    .join(",");
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "manager") {
    return NextResponse.json({ error: "Nav atļaujas." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employee_id"); // "all" or a specific id
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const supabase = await createClient();
  let query = supabase
    .from("time_entries")
    .select("work_date, check_in_time, check_out_time, edited, users(first_name, last_name)")
    .order("work_date", { ascending: true });

  if (employeeId && employeeId !== "all") {
    query = query.eq("employee_id", employeeId);
  }
  if (from) query = query.gte("work_date", from);
  if (to) query = query.lte("work_date", to);

  const { data: entries, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = [
    toCsvRow(["Darbinieks", "Datums", "Check in", "Check out", "Stundas", "Labots"]),
  ];

  for (const e of entries ?? []) {
    const person = e.users as unknown as { first_name: string; last_name: string } | null;
    const checkIn = e.check_in_time ? new Date(e.check_in_time) : null;
    const checkOut = e.check_out_time ? new Date(e.check_out_time) : null;
    const hours =
      checkIn && checkOut
        ? ((checkOut.getTime() - checkIn.getTime()) / 3600000).toFixed(2)
        : "";

    rows.push(
      toCsvRow([
        person ? `${person.first_name} ${person.last_name}` : "",
        e.work_date,
        checkIn ? checkIn.toLocaleTimeString("lv-LV") : "",
        checkOut ? checkOut.toLocaleTimeString("lv-LV") : "",
        hours,
        e.edited ? "Jā" : "Nē",
      ])
    );
  }

  const csv = rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="stundas.csv"`,
    },
  });
}
