import { createClient } from "@/app/utils/supabase/server";
import LlmProvidersManager from "../_components/llm-providers-manager";

const PAGE_SIZE = 20;

export default async function LlmProvidersPage() {
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("llm_providers")
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
          LLM Providers
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Manage LLM service providers
        </p>
      </div>
      <LlmProvidersManager
        initialData={data ?? []}
        totalCount={count ?? 0}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
