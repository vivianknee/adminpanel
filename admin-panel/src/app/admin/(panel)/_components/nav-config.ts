export type NavGroup = {
  label: string;
  items: { href: string; label: string }[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "",
    items: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/images", label: "Images" },
      { href: "/admin/captions", label: "Captions" },
      { href: "/admin/caption-ratings", label: "Caption Ratings" },
      { href: "/admin/caption-examples", label: "Caption Examples" },
      { href: "/admin/caption-requests", label: "Caption Requests" },
    ],
  },
  {
    label: "Humor",
    items: [
      { href: "/admin/humor-flavors", label: "Humor Flavors" },
      { href: "/admin/humor-flavor-steps", label: "Flavor Steps" },
      { href: "/admin/humor-mix", label: "Flavor Mix" },
    ],
  },
  {
    label: "LLM",
    items: [
      { href: "/admin/llm-providers", label: "Providers" },
      { href: "/admin/llm-models", label: "Models" },
      { href: "/admin/llm-prompt-chains", label: "Prompt Chains" },
      { href: "/admin/llm-responses", label: "Model Responses" },
    ],
  },
  {
    label: "Access Control",
    items: [
      { href: "/admin/users", label: "Users" },
      { href: "/admin/allowed-domains", label: "Signup Domains" },
      { href: "/admin/whitelist-emails", label: "Whitelist Emails" },
    ],
  },
  {
    label: "Reference",
    items: [{ href: "/admin/terms", label: "Terms" }],
  },
];
