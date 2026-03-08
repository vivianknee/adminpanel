import { createClient } from "@/app/utils/supabase/server";
import HumorMixManager from "../_components/humor-mix-manager";

const PAGE_SIZE = 20;

export default async function HumorMixPage() {
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("humor_flavor_mix")
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
          Humor Flavor Mix
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Manage humor flavor mix ratios
        </p>
      </div>
      <HumorMixManager
        initialData={data ?? []}
        totalCount={count ?? 0}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
