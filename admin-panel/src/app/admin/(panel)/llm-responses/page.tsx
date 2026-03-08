import { createClient } from "@/app/utils/supabase/server";
import LlmResponsesTable from "../_components/llm-responses-table";

const PAGE_SIZE = 20;

export default async function LlmResponsesPage() {
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("llm_models_responses")
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
          LLM Model Responses
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          View LLM model response records
        </p>
      </div>
      <LlmResponsesTable
        initialData={data ?? []}
        totalCount={count ?? 0}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
