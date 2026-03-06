import { createClient } from "@/app/utils/supabase/server";
import CaptionsTable from "../_components/captions-table";

const PAGE_SIZE = 20;

export default async function CaptionsPage() {
  const supabase = await createClient();

  const { data: captions, count } = await supabase
    .from("captions")
    .select("id, content, like_count, created_datetime_utc, images(url)", {
      count: "exact",
    })
    .order("id", { ascending: false })
    .range(0, PAGE_SIZE - 1);

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          Captions
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          View all generated captions
        </p>
      </div>
      <CaptionsTable
        initialData={captions ?? []}
        totalCount={count ?? 0}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
