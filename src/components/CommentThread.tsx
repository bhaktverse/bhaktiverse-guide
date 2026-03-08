import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  likes_count: number;
  created_at: string;
  replies?: Comment[];
  profile?: { name: string; avatar_url: string | null };
}

interface CommentThreadProps {
  postId: string;
  onCountChange?: (count: number) => void;
}

const CommentThread = ({ postId, onCountChange }: CommentThreadProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) { console.error(error); setLoading(false); return; }

    const commentList: Comment[] = data || [];

    // Fetch profiles
    const userIds = [...new Set(commentList.map(c => c.user_id))];
    let profileMap: Record<string, { name: string; avatar_url: string | null }> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url')
        .in('user_id', userIds);
      profiles?.forEach(p => { profileMap[p.user_id] = p; });
    }

    // Build tree
    const topLevel: Comment[] = [];
    const replyMap: Record<string, Comment[]> = {};
    commentList.forEach(c => {
      c.profile = profileMap[c.user_id];
      if (c.parent_comment_id) {
        if (!replyMap[c.parent_comment_id]) replyMap[c.parent_comment_id] = [];
        replyMap[c.parent_comment_id].push(c);
      } else {
        topLevel.push(c);
      }
    });
    topLevel.forEach(c => { c.replies = replyMap[c.id] || []; });

    setComments(topLevel);
    onCountChange?.(commentList.length);
    setLoading(false);
  }, [postId, onCountChange]);

  useEffect(() => {
    if (expanded) loadComments();
  }, [expanded, loadComments]);

  const submitComment = async (parentId: string | null = null) => {
    if (!user) { toast.error('Please login to comment'); return; }
    const text = parentId ? replyText : newComment;
    if (!text.trim()) return;

    const { error } = await (supabase as any)
      .from('post_comments')
      .insert({ post_id: postId, user_id: user.id, content: text.trim(), parent_comment_id: parentId });

    if (error) { toast.error('Failed to post comment'); return; }

    if (parentId) { setReplyText(''); setReplyingTo(null); }
    else setNewComment('');

    // comments_count is updated automatically by DB trigger
    loadComments();
    toast.success('Comment posted 🙏');
  };

  const deleteComment = async (id: string) => {
    await (supabase as any).from('post_comments').delete().eq('id', id);
    loadComments();
    toast.success('Comment deleted');
  };

  const formatTime = (d: string) => {
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h`;
    return `${Math.floor(mins / 1440)}d`;
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`flex gap-2 ${isReply ? 'ml-8 mt-2' : 'mt-3'}`}>
      <Avatar className="h-7 w-7 flex-shrink-0">
        <AvatarImage src={comment.profile?.avatar_url || undefined} />
        <AvatarFallback className="text-xs bg-muted">
          {comment.profile?.name?.charAt(0) || '🙏'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-muted/50 rounded-lg px-3 py-2">
          <p className="text-xs font-medium">{comment.profile?.name || 'Devotee'}</p>
          <p className="text-sm text-foreground">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
          <span>{formatTime(comment.created_at)}</span>
          {!isReply && user && (
            <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="hover:text-primary font-medium">
              Reply
            </button>
          )}
          {comment.user_id === user?.id && (
            <button onClick={() => deleteComment(comment.id)} className="hover:text-destructive">
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
        {replyingTo === comment.id && (
          <div className="flex gap-2 mt-2 ml-0">
            <Textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="min-h-[60px] text-sm"
            />
            <Button size="sm" onClick={() => submitComment(comment.id)} disabled={!replyText.trim()}>
              <Send className="h-3 w-3" />
            </Button>
          </div>
        )}
        {comment.replies?.map(r => <CommentItem key={r.id} comment={r} isReply />)}
      </div>
    </div>
  );

  return (
    <div className="mt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setExpanded(!expanded)}
        className="text-muted-foreground hover:text-primary w-full justify-start"
      >
        <MessageCircle className="h-4 w-4 mr-1" />
        {expanded ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
        Comments
      </Button>

      {expanded && (
        <div className="mt-2 space-y-1">
          {/* New comment input */}
          {user && (
            <div className="flex gap-2">
              <Textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="min-h-[60px] text-sm"
              />
              <Button size="sm" onClick={() => submitComment()} disabled={!newComment.trim()} className="self-end">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}

          {loading ? (
            <p className="text-sm text-muted-foreground py-2">Loading...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2 text-center">No comments yet. Be the first!</p>
          ) : (
            comments.map(c => <CommentItem key={c.id} comment={c} />)
          )}
        </div>
      )}
    </div>
  );
};

export default CommentThread;
