import { createClient } from "@/app/utils/supabase/server";
import LlmPromptChainsTable from "../_components/llm-prompt-chains-table";

const PAGE_SIZE = 20;

export default async function LlmPromptChainsPage() {
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("llm_prompt_chains")
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
          LLM Prompt Chains
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          View prompt chain records
        </p>
      </div>
      <LlmPromptChainsTable
        initialData={data ?? []}
        totalCount={count ?? 0}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
