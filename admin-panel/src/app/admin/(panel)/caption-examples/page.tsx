import { createClient } from "@/app/utils/supabase/server";
import CaptionExamplesManager from "../_components/caption-examples-manager";

const PAGE_SIZE = 20;

export default async function CaptionExamplesPage() {
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("caption_examples")
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
          Caption Examples
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Manage example captions for training
        </p>
      </div>
      <CaptionExamplesManager
        initialData={data ?? []}
        totalCount={count ?? 0}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
