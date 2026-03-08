import { createClient } from "@/app/utils/supabase/server";
import AllowedDomainsManager from "../_components/allowed-domains-manager";

const PAGE_SIZE = 20;

export default async function AllowedDomainsPage() {
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("allowed_signup_domains")
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
          Allowed Signup Domains
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Manage domains allowed for user registration
        </p>
      </div>
      <AllowedDomainsManager
        initialData={data ?? []}
        totalCount={count ?? 0}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
