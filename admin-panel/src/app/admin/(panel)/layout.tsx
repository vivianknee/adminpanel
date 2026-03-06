import { redirect } from "next/navigation";
import { createClient } from "@/app/utils/supabase/server";
import AdminSidebar from "./_components/admin-sidebar";
import AdminHeader from "./_components/admin-header";

export const metadata = { title: "Admin - Crackd Captions" };

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_superadmin) {
    redirect("/admin/access-denied");
  }

  return (
    <div
      className="min-h-screen flex transition-colors"
      style={{ background: "var(--background)" }}
    >
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <AdminHeader email={user.email ?? ""} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
