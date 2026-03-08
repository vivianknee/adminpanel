import { createClient } from "@/app/utils/supabase/server";
import WhitelistEmailsManager from "../_components/whitelist-emails-manager";

const PAGE_SIZE = 20;

export default async function WhitelistEmailsPage() {
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("whitelist_email_addresses")
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
          Whitelist Emails
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Manage whitelisted email addresses
        </p>
      </div>
      <WhitelistEmailsManager
        initialData={data ?? []}
        totalCount={count ?? 0}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
