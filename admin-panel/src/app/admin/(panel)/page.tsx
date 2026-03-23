import { createClient } from "@/app/utils/supabase/server";
import StatCard from "./_components/stat-card";
import DonutChart from "./_components/donut-chart";
import BarChart from "./_components/bar-chart";
import QuickActions from "./_components/quick-actions";

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

/* SVG Icons for stat cards */
const UsersIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ImagesIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const CaptionsIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const VotesIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

const AvgIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const TrendUpIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const TrendDownIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

const HeartIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

/* Quick Action config */
const QUICK_ACTIONS = [
  { label: "Add Image", href: "/admin/images", icon: ImagesIcon },
  { label: "Manage Users", href: "/admin/users", icon: UsersIcon },
  { label: "Add Term", href: "/admin/terms", icon: CaptionsIcon },
  { label: "Signup Domains", href: "/admin/allowed-domains", icon: TrendUpIcon },
  { label: "Whitelist Emails", href: "/admin/whitelist-emails", icon: HeartIcon },
  { label: "LLM Providers", href: "/admin/llm-providers", icon: AvgIcon },
];

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

  // Image caption counts for bar chart
  const { data: imageCaptionCounts } = await supabase
    .from("captions")
    .select("image_id, images(url)");

  const imageCounts = new Map<string, { url: string; count: number }>();
  if (imageCaptionCounts) {
    for (const row of imageCaptionCounts as { image_id: number; images: { url: string } | { url: string }[] | null }[]) {
      const url = getImageUrl(row.images);
      if (!url) continue;
      const key = String(row.image_id);
      const existing = imageCounts.get(key);
      if (existing) existing.count++;
      else imageCounts.set(key, { url, count: 1 });
    }
  }

  const topImageBars = [...imageCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((img, i) => ({
      label: `Image #${i + 1}`,
      value: img.count,
      color: `var(--chart-${(i % 6) + 1})`,
    }));

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
        <StatCard title="Total Users" value={totalUsers} icon={UsersIcon} />
        <StatCard title="Total Images" value={totalImages} icon={ImagesIcon} />
        <StatCard title="Total Captions" value={totalCaptions} icon={CaptionsIcon} />
        <StatCard title="Total Votes" value={totalVotes} icon={VotesIcon} />
      </div>

      {/* Engagement stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avg Captions / Image"
          value={avgCaptionsPerImage}
          subtitle="caption density"
          icon={AvgIcon}
        />
        <StatCard
          title="Upvote Rate"
          value={upvoteRate}
          subtitle={`${upvotes} upvotes`}
          accent="green"
          icon={TrendUpIcon}
        />
        <StatCard
          title="Downvotes"
          value={downvotes}
          subtitle="total downvotes"
          accent="red"
          icon={TrendDownIcon}
        />
        <StatCard
          title="Net Sentiment"
          value={upvotes - downvotes > 0 ? `+${upvotes - downvotes}` : `${upvotes - downvotes}`}
          subtitle="upvotes minus downvotes"
          icon={HeartIcon}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vote Distribution Donut */}
        <div
          className="rounded-xl p-6 transition-colors"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          <h3
            className="text-sm font-semibold mb-4"
            style={{ color: "var(--foreground)" }}
          >
            Vote Distribution
          </h3>
          <div className="flex items-center justify-center py-2">
            <DonutChart
              segments={[
                { label: "Upvotes", value: upvotes, color: "var(--success-text)" },
                { label: "Downvotes", value: downvotes, color: "var(--error-text)" },
              ]}
            />
          </div>
        </div>

        {/* Captions per Image Bar Chart */}
        <div
          className="rounded-xl p-6 transition-colors"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          <h3
            className="text-sm font-semibold mb-4"
            style={{ color: "var(--foreground)" }}
          >
            Captions per Image (Top 6)
          </h3>
          <BarChart bars={topImageBars} />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3
          className="text-sm font-semibold mb-3"
          style={{ color: "var(--foreground)" }}
        >
          Quick Actions
        </h3>
        <QuickActions actions={QUICK_ACTIONS} />
      </div>

      {/* Top Captions */}
      <div>
        <h3
          className="text-sm font-semibold mb-3"
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
          className="text-sm font-semibold mb-3"
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
