import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminDataTable, { Column } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Eye } from "lucide-react";

interface UserRow {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  spiritual_level: string | null;
  preferred_language: string | null;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [roles, setRoles] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      setUsers((data as UserRow[]) ?? []);

      const { data: roleData } = await supabase.from("user_roles").select("*");
      const map: Record<string, string[]> = {};
      (roleData ?? []).forEach((r: any) => {
        if (!map[r.user_id]) map[r.user_id] = [];
        map[r.user_id].push(r.role);
      });
      setRoles(map);
      setLoading(false);
    };
    load();
  }, []);

  const columns: Column<UserRow>[] = [
    { key: "name", label: "Name" },
    { key: "spiritual_level", label: "Level", render: (r) => <Badge variant="secondary" className="text-xs">{r.spiritual_level ?? "beginner"}</Badge> },
    { key: "preferred_language", label: "Lang", render: (r) => <span className="uppercase text-xs">{r.preferred_language ?? "hi"}</span> },
    { key: "roles", label: "Roles", render: (r) => (
      <div className="flex gap-1">{(roles[r.user_id] ?? ["user"]).map(role => <Badge key={role} variant="outline" className="text-[10px]">{role}</Badge>)}</div>
    )},
    { key: "created_at", label: "Joined", render: (r) => <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-sm text-muted-foreground">{users.length} registered users</p>
      </div>
      <AdminDataTable
        data={users}
        columns={columns}
        searchKey="name"
        loading={loading}
        actions={(row) => (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(row)}>
                <Eye className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{row.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-3 text-sm">
                <p><span className="text-muted-foreground">User ID:</span> {row.user_id}</p>
                <p><span className="text-muted-foreground">Phone:</span> {row.phone ?? "—"}</p>
                <p><span className="text-muted-foreground">Level:</span> {row.spiritual_level}</p>
                <p><span className="text-muted-foreground">Language:</span> {row.preferred_language}</p>
                <p><span className="text-muted-foreground">Joined:</span> {new Date(row.created_at).toLocaleString()}</p>
                <p><span className="text-muted-foreground">Roles:</span> {(roles[row.user_id] ?? ["user"]).join(", ")}</p>
              </div>
            </SheetContent>
          </Sheet>
        )}
      />
    </div>
  );
}
