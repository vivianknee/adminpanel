import { createClient } from "@/app/utils/supabase/server";
import ImagesManager from "../_components/images-manager";

const PAGE_SIZE = 20;

export default async function ImagesPage() {
  const supabase = await createClient();

  const { data: images, count } = await supabase
    .from("images")
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
          Images
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Manage uploaded images
        </p>
      </div>
      <ImagesManager
        initialData={images ?? []}
        totalCount={count ?? 0}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
