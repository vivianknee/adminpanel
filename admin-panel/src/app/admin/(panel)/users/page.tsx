import { createClient } from "@/app/utils/supabase/server";
import UsersTable from "../_components/users-table";

const PAGE_SIZE = 20;

export default async function UsersPage() {
  const supabase = await createClient();

  const { data: profiles, count } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("id", { ascending: true })
    .range(0, PAGE_SIZE - 1);

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          Users
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          View all user profiles
        </p>
      </div>
      <UsersTable
        initialData={profiles ?? []}
        totalCount={count ?? 0}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
