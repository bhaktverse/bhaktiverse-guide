import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminDataTable, { Column } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UserPlus, Trash2 } from "lucide-react";

export default function AdminRoles() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState<string>("moderator");

  const load = async () => {
    const { data } = await supabase.from("user_roles").select("*").order("created_at", { ascending: false });
    setRoles(data ?? []); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addRole = async () => {
    if (!newUserId.trim()) return toast.error("Enter a user ID");
    const { error } = await supabase.from("user_roles").insert({ user_id: newUserId.trim(), role: newRole as any });
    if (error) return toast.error(error.message);
    toast.success("Role assigned");
    setNewUserId("");
    load();
  };

  const removeRole = async (id: string) => {
    await supabase.from("user_roles").delete().eq("id", id);
    toast.success("Role removed");
    load();
  };

  const columns: Column<any>[] = [
    { key: "user_id", label: "User ID", render: (r) => <span className="text-xs font-mono">{r.user_id.slice(0, 12)}...</span> },
    { key: "role", label: "Role", render: (r) => <Badge variant={r.role === "admin" ? "default" : "secondary"} className="text-[10px]">{r.role}</Badge> },
    { key: "created_at", label: "Assigned", render: (r) => <span className="text-xs">{new Date(r.created_at).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">Admin Role Management</h1>
        <p className="text-sm text-muted-foreground">{roles.length} role assignments</p>
      </div>
      <div className="flex flex-wrap gap-2 items-end p-4 rounded-lg border border-border/30 bg-card/60">
        <div>
          <label className="text-xs text-muted-foreground">User ID</label>
          <Input value={newUserId} onChange={e => setNewUserId(e.target.value)} placeholder="UUID..." className="w-[280px]" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Role</label>
          <Select value={newRole} onValueChange={setNewRole}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={addRole} size="sm"><UserPlus className="h-4 w-4 mr-1" />Assign</Button>
      </div>
      <AdminDataTable
        data={roles} columns={columns} loading={loading}
        actions={(row) => (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeRole(row.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      />
    </div>
  );
}
