import { createClient } from "@/app/utils/supabase/server";
import StatCard from "./_components/stat-card";

type CaptionRow = {
  id: number;
  content: string;
  like_count: number;
  created_datetime_utc?: string;
  images: { url: string } | { url: string }[] | null;
};

function getImageUrl(
  images: CaptionRow["images"]
): string | null {
  if (!images) return null;
  if (Array.isArray(images)) return images[0]?.url ?? null;
  return images.url ?? null;
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch all counts in parallel
  const [usersRes, imagesRes, captionsRes, votesRes] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("images").select("*", { count: "exact", head: true }),
    supabase.from("captions").select("*", { count: "exact", head: true }),
    supabase.from("caption_votes").select("*", { count: "exact", head: true }),
  ]);

  const totalUsers = usersRes.count ?? 0;
  const totalImages = imagesRes.count ?? 0;
  const totalCaptions = captionsRes.count ?? 0;
  const totalVotes = votesRes.count ?? 0;

  // Vote breakdown
  const [upvoteRes, downvoteRes] = await Promise.all([
    supabase
      .from("caption_votes")
      .select("*", { count: "exact", head: true })
      .eq("vote_value", 1),
    supabase
      .from("caption_votes")
      .select("*", { count: "exact", head: true })
      .eq("vote_value", -1),
  ]);

  const upvotes = upvoteRes.count ?? 0;
  const downvotes = downvoteRes.count ?? 0;

  // Top captions by likes
  const { data: topCaptions } = await supabase
    .from("captions")
    .select("id, content, like_count, images(url)")
    .order("like_count", { ascending: false })
    .limit(5);

  // Recent captions
  const { data: recentCaptions } = await supabase
    .from("captions")
    .select("id, content, like_count, created_datetime_utc, images(url)")
    .order("id", { ascending: false })
    .limit(10);

  const avgCaptionsPerImage =
    totalImages > 0 ? (totalCaptions / totalImages).toFixed(1) : "0";

  const upvoteRate =
    totalVotes > 0 ? ((upvotes / totalVotes) * 100).toFixed(0) + "%" : "N/A";

  return (
    <div className="space-y-8">
      <div>
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--foreground)" }}
        >
          Dashboard
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Overview of Crackd Captions activity
        </p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={totalUsers} />
        <StatCard title="Total Images" value={totalImages} />
        <StatCard title="Total Captions" value={totalCaptions} />
        <StatCard title="Total Votes" value={totalVotes} />
      </div>

      {/* Engagement stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avg Captions / Image"
          value={avgCaptionsPerImage}
          subtitle="caption density"
        />
        <StatCard
          title="Upvote Rate"
          value={upvoteRate}
          subtitle={`${upvotes} upvotes`}
          accent="green"
        />
        <StatCard
          title="Downvotes"
          value={downvotes}
          subtitle="total downvotes"
          accent="red"
        />
        <StatCard
          title="Net Sentiment"
          value={upvotes - downvotes > 0 ? `+${upvotes - downvotes}` : `${upvotes - downvotes}`}
          subtitle="upvotes minus downvotes"
        />
      </div>

      {/* Top Captions */}
      <div>
        <h3
          className="text-lg font-bold mb-3"
          style={{ color: "var(--foreground)" }}
        >
          Top Captions
        </h3>
        <div
          className="rounded-xl overflow-hidden transition-colors"
          style={{ border: "1px solid var(--card-border)" }}
        >
          {(topCaptions as CaptionRow[] | null)?.length ? (
            <ul>
              {(topCaptions as CaptionRow[]).map((caption, i) => {
                const imgUrl = getImageUrl(caption.images);
                return (
                  <li
                    key={caption.id}
                    className="flex items-center gap-4 px-4 py-3 transition-colors"
                    style={{
                      borderTop: i > 0 ? "1px solid var(--card-border)" : undefined,
                    }}
                  >
                    <span
                      className="text-sm font-bold w-6 text-center shrink-0"
                      style={{ color: "var(--accent)" }}
                    >
                      {i + 1}
                    </span>
                    {imgUrl && (
                      <img
                        src={imgUrl}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                        style={{ background: "var(--subtle-bg)" }}
                      />
                    )}
                    <p
                      className="flex-1 text-sm truncate"
                      style={{ color: "var(--foreground)" }}
                    >
                      {caption.content}
                    </p>
                    <span
                      className="text-xs font-medium shrink-0 px-2 py-1 rounded-full"
                      style={{
                        background: "var(--vote-up-hover-bg)",
                        color: "var(--vote-up-hover-text)",
                      }}
                    >
                      {caption.like_count} likes
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p
              className="px-4 py-8 text-center text-sm"
              style={{ color: "var(--muted)" }}
            >
              No captions yet.
            </p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3
          className="text-lg font-bold mb-3"
          style={{ color: "var(--foreground)" }}
        >
          Recent Activity
        </h3>
        <div
          className="rounded-xl overflow-hidden transition-colors"
          style={{ border: "1px solid var(--card-border)" }}
        >
          {(recentCaptions as CaptionRow[] | null)?.length ? (
            <ul>
              {(recentCaptions as CaptionRow[]).map((caption, i) => {
                const imgUrl = getImageUrl(caption.images);
                return (
                  <li
                    key={caption.id}
                    className="flex items-center gap-4 px-4 py-3 transition-colors"
                    style={{
                      borderTop:
                        i > 0 ? "1px solid var(--card-border)" : undefined,
                    }}
                  >
                    {imgUrl && (
                      <img
                        src={imgUrl}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                        style={{ background: "var(--subtle-bg)" }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm truncate"
                        style={{ color: "var(--foreground)" }}
                      >
                        {caption.content}
                      </p>
                      {caption.created_datetime_utc && (
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--muted)" }}
                        >
                          {new Date(
                            caption.created_datetime_utc
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                    <span
                      className="text-xs shrink-0"
                      style={{ color: "var(--muted)" }}
                    >
                      {caption.like_count} likes
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p
              className="px-4 py-8 text-center text-sm"
              style={{ color: "var(--muted)" }}
            >
              No recent activity.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
