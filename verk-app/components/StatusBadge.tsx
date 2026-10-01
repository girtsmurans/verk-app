const LABELS: Record<string, string> = {
  new: "Jauns",
  approved: "Apstiprināts",
  completed: "Izpildīts",
};

const CLASSES: Record<string, string> = {
  new: "badge-new",
  approved: "badge-approved",
  completed: "badge-completed",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${CLASSES[status] ?? "badge-new"}`}>
      {LABELS[status] ?? status}
    </span>
  );
}

export function UrgentBadge() {
  return <span className="badge badge-urgent">Steidzami</span>;
}
