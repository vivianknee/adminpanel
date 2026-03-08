import { createClient } from "@/app/utils/supabase/server";
import TermsManager from "../_components/terms-manager";

const PAGE_SIZE = 20;

export default async function TermsPage() {
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("terms")
    .select("*", { count: "exact" })
    .order("id", { ascending: false })
    .range(0, PAGE_SIZE - 1);

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          Terms
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Manage terms and definitions
        </p>
      </div>
      <TermsManager
        initialData={data ?? []}
        totalCount={count ?? 0}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
