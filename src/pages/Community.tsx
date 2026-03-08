import React, { useState, useEffect } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import Breadcrumbs from '@/components/Breadcrumbs';
import CommentThread from '@/components/CommentThread';
import { supabase } from '@/integrations/supabase/client';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Plus, 
  Send,
  Sparkles,
  Users,
  TrendingUp,
  Filter,
  Search,
  Image,
  Video,
  Mic,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  post_type: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  visibility: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
  media_urls: string[];
}

interface UserProfile {
  user_id: string;
  name: string;
  avatar_url: string | null;
}

const Community = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  usePageTitle('Spiritual Community');
  
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [pendingImages, setPendingImages] = useState<{ file: File; preview: string }[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('');
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [totalMembers, setTotalMembers] = useState(0);
  const [activeDevotees, setActiveDevotees] = useState(0);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [totalBlessings, setTotalBlessings] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const PAGE_SIZE = 20;

  // Centralized helper for untyped post_likes table
  const postLikesTable = () => supabase.from('post_likes' as any) as any;

  const availableTags = [
    'devotion', 'experience', 'learning', 'ritual', 'festival', 'pilgrimage',
    'meditation', 'mantra', 'bhajan', 'temple-visit', 'spiritual-growth'
  ];

  useEffect(() => {
    loadPosts();
    loadTotalMembers();
    loadActiveThisWeek();
    loadCommunityStats();

    const channel = supabase
      .channel('community_posts_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_posts' },
        async (payload) => {
          const newPost = payload.new as any;
          if (newPost.visibility !== 'public') return;
          if (newPost.user_id === user?.id) return;
          
          const transformed = {
            ...newPost,
            tags: Array.isArray(newPost.tags) ? newPost.tags.map((t: any) => String(t)) : [],
            media_urls: Array.isArray(newPost.media_urls) ? newPost.media_urls.map((u: any) => String(u)) : []
          };
          setPosts(prev => [transformed, ...prev]);

          if (!userProfiles[newPost.user_id]) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('user_id, name, avatar_url')
              .eq('user_id', newPost.user_id)
              .maybeSingle();
            if (profile) {
              setUserProfiles(prev => ({ ...prev, [profile.user_id]: profile }));
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'community_posts' },
        (payload) => {
          setPosts(prev => prev.filter(p => p.id !== payload.old.id));
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'community_posts' },
        (payload) => {
          const updated = payload.new as any;
          setPosts(prev => prev.map(p => p.id === updated.id ? {
            ...updated,
            tags: Array.isArray(updated.tags) ? updated.tags.map((t: any) => String(t)) : [],
            media_urls: Array.isArray(updated.media_urls) ? updated.media_urls.map((u: any) => String(u)) : []
          } : p));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const loadTotalMembers = async () => {
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    if (count !== null) setTotalMembers(count);
  };

  const loadActiveThisWeek = async () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { data } = await supabase
      .from('community_posts')
      .select('user_id')
      .gte('created_at', weekAgo.toISOString());
    if (data) {
      const uniqueIds = new Set(data.map(d => d.user_id));
      setActiveDevotees(uniqueIds.size);
    }
  };

  const loadCommunityStats = async () => {
    const { data } = await supabase
      .from('community_posts')
      .select('likes_count, comments_count')
      .eq('visibility', 'public');
    if (data) {
      setTotalBlessings(data.reduce((sum, p) => sum + (p.likes_count || 0), 0));
      setTotalComments(data.reduce((sum, p) => sum + (p.comments_count || 0), 0));
    }
  };

  const loadPosts = async (append = false) => {
    try {
      if (!append) setLoading(true);
      
      const offset = append ? posts.length : 0;
      
      const { data: communityPosts, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) throw error;

      const transformedPosts = communityPosts?.map(post => ({
        ...post,
        tags: Array.isArray(post.tags) ? post.tags.map(tag => String(tag)) : [],
        media_urls: Array.isArray(post.media_urls) ? post.media_urls.map(u => String(u)) : []
      })) || [];

      if (append) {
        setPosts(prev => [...prev, ...transformedPosts]);
      } else {
        setPosts(transformedPosts);
      }
      
      setHasMore(transformedPosts.length >= PAGE_SIZE);

      // Batch query profiles
      const uniqueUserIds = [...new Set(transformedPosts.map(p => p.user_id))];
      if (uniqueUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name, avatar_url')
          .in('user_id', uniqueUserIds);

        if (profiles) {
          const profileMap: Record<string, UserProfile> = {};
          profiles.forEach(p => { profileMap[p.user_id] = p; });
          setUserProfiles(prev => ({ ...prev, ...profileMap }));
        }
        // Active devotees now loaded separately via loadActiveThisWeek
      }

      // Load user's likes
      if (user) {
        const allPostIds = append 
          ? [...posts, ...transformedPosts].map(p => p.id) 
          : transformedPosts.map(p => p.id);
        
        if (allPostIds.length > 0) {
          const { data: likes } = await supabase
            .from('post_likes' as any)
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', allPostIds);
          
          if (likes) {
            setUserLikes(prev => {
              const newSet = new Set(prev);
              (likes as any[]).forEach(l => newSet.add(l.post_id));
              return newSet;
            });
          }
        }
      }
      
    } catch (error) {
      console.error('Error loading community posts:', error);
      toast.error("Failed to load community posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages = Array.from(files).slice(0, 4 - pendingImages.length).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setPendingImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setPendingImages(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const createPost = async () => {
    if (!newPost.trim() && pendingImages.length === 0) return;

    try {
      let mediaUrls: string[] = [];

      // Upload images if any
      if (pendingImages.length > 0) {
        setUploadingImages(true);
        for (const img of pendingImages) {
          const ext = img.file.name.split('.').pop() || 'jpg';
          const path = `posts/${user?.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from('community-media')
            .upload(path, img.file);
          if (uploadError) throw uploadError;
          const { data: urlData } = supabase.storage.from('community-media').getPublicUrl(path);
          mediaUrls.push(urlData.publicUrl);
        }
        setUploadingImages(false);
      }

      const postType = mediaUrls.length > 0 ? 'image' : 'text';

      const { data: newPostData, error } = await supabase
        .from('community_posts')
        .insert([
          {
            user_id: user?.id,
            content: newPost,
            post_type: postType,
            tags: selectedTags,
            visibility: 'public',
            media_urls: mediaUrls
          }
        ])
        .select('*')
        .single();

      if (error) throw error;

      const transformedPost = {
        ...newPostData,
        tags: Array.isArray(newPostData.tags) ? newPostData.tags.map(tag => String(tag)) : [],
        media_urls: Array.isArray(newPostData.media_urls) ? newPostData.media_urls.map(u => String(u)) : []
      };

      setPosts([transformedPost, ...posts]);
      setNewPost('');
      setSelectedTags([]);
      setPendingImages([]);
      setShowCreatePost(false);
      
      toast.success("Your spiritual post has been shared with the community! ✨");
      
    } catch (error) {
      console.error('Error creating post:', error);
      setUploadingImages(false);
      toast.error("Failed to create post. Please try again.");
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const isLiked = userLikes.has(postId);
    
    // Optimistic update
    setUserLikes(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
    setPosts(prev => prev.map(p => p.id === postId 
      ? { ...p, likes_count: p.likes_count + (isLiked ? -1 : 1) } 
      : p
    ));

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('post_likes' as any)
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_likes' as any)
          .insert({ user_id: user.id, post_id: postId });
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update
      setUserLikes(prev => {
        const newSet = new Set(prev);
        if (isLiked) newSet.add(postId);
        else newSet.delete(postId);
        return newSet;
      });
      setPosts(prev => prev.map(p => p.id === postId 
        ? { ...p, likes_count: p.likes_count + (isLiked ? 1 : -1) } 
        : p
      ));
    }
  };

  const sharePost = async (post: CommunityPost) => {
    const shareData = {
      title: 'BhaktVerse Community',
      text: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
      url: `${window.location.origin}/community`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
        toast.success("Post link copied to clipboard! 📋");
      }
      // Increment shares_count
      await supabase
        .from('community_posts')
        .update({ shares_count: post.shares_count + 1 })
        .eq('id', post.id);
      
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, shares_count: p.shares_count + 1 } : p));
    } catch (error) {
      if ((error as any)?.name !== 'AbortError') {
        console.error('Share error:', error);
      }
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setPosts(posts.filter(p => p.id !== postId));
      toast.success("Your post has been removed.");
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error("Could not delete post.");
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Mic className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getDisplayName = (userId: string) => {
    if (userId === user?.id) return 'You';
    const profile = userProfiles[userId];
    if (profile?.name) {
      const parts = profile.name.trim().split(' ');
      if (parts.length > 1) return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
      return parts[0];
    }
    return 'Devotee';
  };

  const getAvatarUrl = (userId: string) => {
    return userProfiles[userId]?.avatar_url || undefined;
  };

  const getAvatarInitial = (userId: string) => {
    if (userId === user?.id) return user?.email?.charAt(0).toUpperCase() || 'Y';
    const profile = userProfiles[userId];
    return profile?.name?.charAt(0).toUpperCase() || '🙏';
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !filterTag || post.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-peace flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-om-pulse">👥</div>
          <p className="text-muted-foreground">Loading spiritual community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <Breadcrumbs className="mb-4" />
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-temple bg-clip-text text-transparent mb-2">
            Spiritual Community 👥
          </h1>
          <p className="text-muted-foreground">
            Share your spiritual journey and connect with fellow devotees
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Create Post */}
            <Card className="card-sacred">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={getAvatarUrl(user?.id || '')} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.email?.charAt(0).toUpperCase() || 'G'}
                    </AvatarFallback>
                  </Avatar>
                  {user ? (
                    <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1 justify-start">
                          Share your spiritual experience...
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Share with Community</DialogTitle>
                          <DialogDescription>
                            Share your spiritual insights, experiences, or questions
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="What's on your spiritual mind today?"
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            className="min-h-[100px]"
                          />
                          
                          <div>
                            <p className="text-sm font-medium mb-2">Add tags:</p>
                            <div className="flex flex-wrap gap-1">
                              {availableTags.map(tag => (
                                <Badge
                                  key={tag}
                                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                                  className="cursor-pointer text-xs"
                                  onClick={() => {
                                    if (selectedTags.includes(tag)) {
                                      setSelectedTags(selectedTags.filter(t => t !== tag));
                                    } else {
                                      setSelectedTags([...selectedTags, tag]);
                                    }
                                  }}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {/* Image upload */}
                          <div className="flex items-center gap-2">
                            <label className="cursor-pointer inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                              <Image className="h-4 w-4" />
                              <span>Add Photos</span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleImageSelect}
                                disabled={pendingImages.length >= 4}
                              />
                            </label>
                            {pendingImages.length > 0 && (
                              <span className="text-xs text-muted-foreground">{pendingImages.length}/4</span>
                            )}
                          </div>

                          {/* Image previews */}
                          {pendingImages.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {pendingImages.map((img, i) => (
                                <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-border">
                                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                                  <button
                                    onClick={() => removeImage(i)}
                                    className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <Button onClick={createPost} className="w-full" disabled={uploadingImages}>
                            {uploadingImages ? (
                              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>
                            ) : (
                              <><Send className="h-4 w-4 mr-2" />Share with Community</>
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button variant="outline" className="flex-1 justify-start" onClick={() => navigate('/auth')}>
                      Login to share your spiritual experience...
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Search and Filter */}
            <Card className="card-sacred">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    {searchQuery && (
                      <p className="text-xs text-muted-foreground mt-1 pl-1">Searching within loaded posts</p>
                    )}
                  </div>
                  <Select value={filterTag || 'all'} onValueChange={(v) => setFilterTag(v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-full md:w-[160px]">
                      <SelectValue placeholder="All Topics" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      {availableTags.map(tag => (
                        <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Posts */}
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="card-sacred hover:shadow-divine transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={getAvatarUrl(post.user_id)} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getAvatarInitial(post.user_id)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">
                          {getDisplayName(post.user_id)}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center space-x-2">
                          {getPostTypeIcon(post.post_type)}
                          <span>{formatTimeAgo(post.created_at)}</span>
                          {post.featured && (
                            <Badge variant="secondary" className="text-xs">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    {/* Media Gallery */}
                    {post.media_urls && post.media_urls.length > 0 && (
                      <div className={`grid gap-2 mb-4 ${post.media_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {post.media_urls.map((url, idx) => (
                          <img 
                            key={idx} 
                            src={url} 
                            alt={`Post media ${idx + 1}`} 
                            className="rounded-lg w-full h-48 object-cover border border-border/50"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    )}

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLike(post.id)}
                          aria-label={userLikes.has(post.id) ? 'Unlike post' : 'Like post'}
                          className={`hover:text-primary ${userLikes.has(post.id) ? 'text-destructive' : 'text-muted-foreground'}`}
                        >
                          <Heart className={`h-4 w-4 mr-1 ${userLikes.has(post.id) ? 'fill-current' : ''}`} />
                          <span>{post.likes_count}</span>
                        </Button>
                        
                        <span className="text-muted-foreground text-sm flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.comments_count}
                        </span>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label="Share post"
                          className="text-muted-foreground hover:text-primary"
                          onClick={() => sharePost(post)}
                        >
                          <Share className="h-4 w-4 mr-1" />
                          <span>{post.shares_count}</span>
                        </Button>
                      </div>
                      {post.user_id === user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePost(post.id)}
                          aria-label="Delete post"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                    
                    <CommentThread postId={post.id} />
                  </CardContent>
                </Card>
              ))}
              
              {filteredPosts.length === 0 && (
                <Card className="card-sacred">
                  <CardContent className="p-12 text-center">
                    <div className="text-6xl mb-4">🕊️</div>
                    <p className="text-muted-foreground">
                      No posts found. Be the first to share your spiritual journey!
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Load More */}
              {hasMore && filteredPosts.length > 0 && !searchQuery && !filterTag && (
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setLoadingMore(true);
                      loadPosts(true).finally(() => setLoadingMore(false));
                    }}
                    disabled={loadingMore}
                    className="gap-2"
                  >
                    {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {loadingMore ? 'Loading...' : 'और पोस्ट देखें / Load More'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Community Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{totalMembers}</div>
                  <p className="text-sm text-muted-foreground">Total Members</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{activeDevotees}</div>
                  <p className="text-sm text-muted-foreground">Active This Week</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {posts.reduce((sum, p) => sum + (p.likes_count || 0), 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Blessings Shared</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    {posts.reduce((sum, p) => sum + (p.comments_count || 0), 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Comments</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-sacred">
              <CardHeader>
                <CardTitle>Popular Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {availableTags.slice(0, 8).map(tag => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10 text-xs"
                      onClick={() => setFilterTag(tag)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="card-sacred">
              <CardHeader>
                <CardTitle>Community Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>🙏 Respect all spiritual traditions</p>
                <p>💝 Share authentic experiences</p>
                <p>🕊️ Maintain peaceful discourse</p>
                <p>✨ Inspire and uplift others</p>
                <p>🚫 No spam or harmful content</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <MobileBottomNav />
    </div>
  );
};

export default Community;
