import { createClient } from "@/app/utils/supabase/server";
import HumorFlavorsTable from "../_components/humor-flavors-table";

const PAGE_SIZE = 20;

export default async function HumorFlavorsPage() {
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("humor_flavors")
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
          Humor Flavors
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          View humor flavor configurations
        </p>
      </div>
      <HumorFlavorsTable
        initialData={data ?? []}
        totalCount={count ?? 0}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
