import { createClient } from "@/app/utils/supabase/server";
import CaptionRequestsTable from "../_components/caption-requests-table";

const PAGE_SIZE = 20;

export default async function CaptionRequestsPage() {
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("caption_requests")
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
          Caption Requests
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          View caption generation requests
        </p>
      </div>
      <CaptionRequestsTable
        initialData={data ?? []}
        totalCount={count ?? 0}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
