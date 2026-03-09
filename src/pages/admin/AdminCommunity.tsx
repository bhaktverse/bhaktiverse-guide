import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminDataTable, { Column } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Star } from "lucide-react";
import { toast } from "sonner";

export default function AdminCommunity() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("community_posts").select("*").order("created_at", { ascending: false });
    setPosts(data ?? []); setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleFeatured = async (post: any) => {
    await supabase.from("community_posts").update({ featured: !post.featured }).eq("id", post.id);
    toast.success(post.featured ? "Unfeatured" : "Featured"); load();
  };

  const deletePost = async (id: string) => {
    await supabase.from("community_posts").delete().eq("id", id);
    toast.success("Post deleted"); load();
  };

  const bulkDelete = async (ids: string[]) => {
    for (const id of ids) { await supabase.from("community_posts").delete().eq("id", id); }
    toast.success(`Deleted ${ids.length} posts`); load();
  };

  const columns: Column<any>[] = [
    { key: "content", label: "Content", render: (r) => <span className="truncate max-w-[200px] block text-xs">{r.content}</span> },
    { key: "post_type", label: "Type", render: (r) => <Badge variant="outline" className="text-[10px]">{r.post_type}</Badge> },
    { key: "likes_count", label: "Likes" },
    { key: "comments_count", label: "Comments" },
    { key: "featured", label: "Featured", render: (r) => r.featured ? <Badge className="bg-[hsl(var(--warning))] text-[10px]">★</Badge> : "—" },
    { key: "created_at", label: "Date", render: (r) => <span className="text-xs">{new Date(r.created_at).toLocaleDateString()}</span> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold">Community Moderation</h1>
        <p className="text-sm text-muted-foreground">{posts.length} posts</p>
      </div>
      <AdminDataTable
        data={posts} columns={columns} searchKey="content" loading={loading}
        enableBulkSelect
        bulkActions={(ids) => (
          <Button variant="destructive" size="sm" onClick={() => bulkDelete(ids)}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete ({ids.length})
          </Button>
        )}
        actions={(row) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleFeatured(row)}>
              <Star className={`h-4 w-4 ${row.featured ? "fill-primary text-primary" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deletePost(row.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />
    </div>
  );
}
