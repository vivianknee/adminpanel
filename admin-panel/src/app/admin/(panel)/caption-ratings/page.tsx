import { createClient } from "@/app/utils/supabase/server";
import StatCard from "../_components/stat-card";
import BarChart from "../_components/bar-chart";

type CaptionStats = {
  id: number;
  content: string;
  upvotes: number;
  downvotes: number;
  total: number;
  net: number;
  controversy: number;
};

const RatedIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

const UnratedIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const VotesIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const AvgIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

export default async function CaptionRatingsPage() {
  const supabase = await createClient();

  const [{ data: captions }, { data: votes }] = await Promise.all([
    supabase.from("captions").select("id, content"),
    supabase.from("caption_votes").select("caption_id, vote_value"),
  ]);

  // Aggregate votes per caption
  const voteMap = new Map<number, { up: number; down: number }>();
  for (const vote of votes ?? []) {
    const existing = voteMap.get(vote.caption_id) ?? { up: 0, down: 0 };
    if (vote.vote_value === 1) existing.up++;
    else existing.down++;
    voteMap.set(vote.caption_id, existing);
  }

  const captionStats: CaptionStats[] = (captions ?? []).map((c) => {
    const v = voteMap.get(c.id) ?? { up: 0, down: 0 };
    const total = v.up + v.down;
    const net = v.up - v.down;
    // Controversy: 100 = perfectly split, 0 = all one direction
    const controversy = total > 0 ? Math.round((1 - Math.abs(net) / total) * 100) : 0;
    return { id: c.id, content: c.content, upvotes: v.up, downvotes: v.down, total, net, controversy };
  });

  const ratedCaptions = captionStats.filter((c) => c.total > 0);
  const unratedCount = captionStats.length - ratedCaptions.length;
  const totalVotesCast = captionStats.reduce((sum, c) => sum + c.total, 0);
  const avgVotesPerRated =
    ratedCaptions.length > 0
      ? (totalVotesCast / ratedCaptions.length).toFixed(1)
      : "0";

  const topByVotes = [...captionStats]
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const mostControversial = [...captionStats]
    .filter((c) => c.total >= 2)
    .sort((a, b) => b.controversy - a.controversy || b.total - a.total)
    .slice(0, 8);

  const topVoteBars = topByVotes.map((c, i) => ({
    label: `#${c.id}`,
    value: c.total,
    color: `var(--chart-${(i % 6) + 1})`,
  }));

  const controversyBars = mostControversial.map((c, i) => ({
    label: `#${c.id}`,
    value: c.controversy,
    color: `var(--chart-${(i % 6) + 1})`,
  }));

  const tableData = [...captionStats]
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 30);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
          Caption Ratings
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          How users are rating captions
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Rated Captions" value={ratedCaptions.length} icon={RatedIcon} />
        <StatCard title="Unrated Captions" value={unratedCount} icon={UnratedIcon} />
        <StatCard title="Total Votes Cast" value={totalVotesCast} icon={VotesIcon} />
        <StatCard title="Avg Votes / Rated" value={avgVotesPerRated} subtitle="engagement depth" icon={AvgIcon} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="rounded-xl p-6"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
        >
          <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>
            Most Voted Captions
          </h3>
          <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
            Total votes (up + down) per caption
          </p>
          <BarChart bars={topVoteBars} />
        </div>

        <div
          className="rounded-xl p-6"
          style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
        >
          <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>
            Most Controversial
          </h3>
          <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
            % of votes on losing side (100 = perfectly split)
          </p>
          <BarChart bars={controversyBars} />
        </div>
      </div>

      {/* Ratings table */}
      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>
          Caption Vote Breakdown
        </h3>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--card-border)" }}
        >
          {tableData.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--subtle-bg)", borderBottom: "1px solid var(--card-border)" }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "var(--muted)" }}>
                    Caption
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: "var(--muted)" }}>
                    Upvotes
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: "var(--muted)" }}>
                    Downvotes
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: "var(--muted)" }}>
                    Total
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: "var(--muted)" }}>
                    Net Score
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: "var(--muted)" }}>
                    Controversy
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((c, i) => (
                  <tr
                    key={c.id}
                    style={{
                      borderTop: i > 0 ? "1px solid var(--card-border)" : undefined,
                    }}
                  >
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-xs font-mono mb-0.5" style={{ color: "var(--muted)" }}>
                        #{c.id}
                      </p>
                      <p className="text-sm truncate" style={{ color: "var(--foreground)" }}>
                        {c.content}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: "var(--vote-up-hover-bg)",
                          color: "var(--vote-up-hover-text)",
                        }}
                      >
                        +{c.upvotes}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: c.downvotes > 0 ? "var(--vote-down-hover-bg)" : "var(--subtle-bg)",
                          color: c.downvotes > 0 ? "var(--vote-down-hover-text)" : "var(--muted)",
                        }}
                      >
                        -{c.downvotes}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                        {c.total}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className="text-sm font-semibold"
                        style={{
                          color:
                            c.net > 0
                              ? "var(--vote-up-hover-text)"
                              : c.net < 0
                                ? "var(--vote-down-hover-text)"
                                : "var(--muted)",
                        }}
                      >
                        {c.net > 0 ? `+${c.net}` : c.net}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div
                          className="w-16 h-1.5 rounded-full overflow-hidden"
                          style={{ background: "var(--subtle-bg)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${c.controversy}%`,
                              background:
                                c.controversy >= 70
                                  ? "var(--error-text)"
                                  : c.controversy >= 40
                                    ? "var(--warning-text, var(--accent))"
                                    : "var(--success-text)",
                            }}
                          />
                        </div>
                        <span className="text-xs w-8 text-right" style={{ color: "var(--muted)" }}>
                          {c.controversy}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-4 py-8 text-center text-sm" style={{ color: "var(--muted)" }}>
              No votes recorded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
