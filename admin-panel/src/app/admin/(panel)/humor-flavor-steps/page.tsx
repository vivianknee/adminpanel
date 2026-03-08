import { createClient } from "@/app/utils/supabase/server";
import HumorFlavorStepsTable from "../_components/humor-flavor-steps-table";

const PAGE_SIZE = 20;

export default async function HumorFlavorStepsPage() {
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("humor_flavor_steps")
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
          Humor Flavor Steps
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          View flavor step configurations
        </p>
      </div>
      <HumorFlavorStepsTable
        initialData={data ?? []}
        totalCount={count ?? 0}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
