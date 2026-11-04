import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/empty-state";
import { requireAdmin } from "@/lib/auth/session";
import { AdminPage } from "@/features/admin/components/admin-page";
import { UserRoleControl } from "@/features/admin/components/user-role-control";
import { getAdminUsers } from "@/features/admin/queries";

export const metadata: Metadata = { title: "Admin · Users", robots: { index: false, follow: false } };

async function UsersContent({ searchParams }: { searchParams: PageProps<"/admin/users">["searchParams"] }) {
  const admin = await requireAdmin("/admin/users");
  const raw = await searchParams;
  const q = typeof raw.q === "string" ? raw.q.slice(0, 60) : undefined;
  const users = await getAdminUsers(q);

  return (
    <div className="space-y-6">
      <form method="get" action="/admin/users" role="search" className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <label htmlFor="uf-q" className="text-sm font-medium text-slate-800">
            Search name or email
          </label>
          <Input id="uf-q" name="q" defaultValue={q ?? ""} className="w-64" maxLength={60} />
        </div>
        <Button type="submit">Search</Button>
        {q && (
          <Link href="/admin/users" className="pb-2 text-sm font-medium text-lagoon-700 hover:underline">
            Clear
          </Link>
        )}
      </form>

      {users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" description="Try a different search." />
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card ring-1 ring-slate-900/5">
          <table className="w-full min-w-[680px] text-left text-sm">
            <caption className="sr-only">Registered users</caption>
            <thead className="border-b border-border text-xs text-muted-foreground uppercase">
              <tr>
                {["User", "Joined", "Bookings", "Role", "Actions"].map((h) => (
                  <th key={h} scope="col" className="px-5 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{u.full_name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      {u.email}
                      {u.phone ? ` · ${u.phone}` : ""}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    {new Date(u.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </td>
                  <td className="px-5 py-4">{u.bookings[0]?.count ?? 0}</td>
                  <td className="px-5 py-4">
                    <Badge variant={u.role === "admin" ? "default" : "soft"} className="capitalize">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <UserRoleControl userId={u.id} email={u.email} role={u.role} isSelf={u.id === admin.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage(props: PageProps<"/admin/users">) {
  return (
    <AdminPage title="Users" description="Registered accounts. Roles can only be changed by administrators.">
      <UsersContent searchParams={props.searchParams} />
    </AdminPage>
  );
}
