import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Navigation from '@/components/Navigation';
import MobileBottomNav from '@/components/MobileBottomNav';
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
  Mic
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
}

const Community = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('');

  const availableTags = [
    'devotion', 'experience', 'learning', 'ritual', 'festival', 'pilgrimage',
    'meditation', 'mantra', 'bhajan', 'temple-visit', 'spiritual-growth'
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      loadPosts();
    }
  }, [user, authLoading, navigate]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      
      const { data: communityPosts, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const transformedPosts = communityPosts?.map(post => ({
        ...post,
        tags: Array.isArray(post.tags) ? post.tags.map(tag => String(tag)) : []
      })) || [];

      setPosts(transformedPosts);
      
    } catch (error) {
      console.error('Error loading community posts:', error);
      toast({
        title: "Error",
        description: "Failed to load community posts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPost.trim()) return;

    try {
      const { data: newPostData, error } = await supabase
        .from('community_posts')
        .insert([
          {
            user_id: user?.id,
            content: newPost,
            post_type: 'text',
            tags: selectedTags,
            visibility: 'public'
          }
        ])
        .select('*')
        .single();

      if (error) throw error;

      const transformedPost = {
        ...newPostData,
        tags: Array.isArray(newPostData.tags) ? newPostData.tags.map(tag => String(tag)) : []
      };

      setPosts([transformedPost, ...posts]);
      setNewPost('');
      setSelectedTags([]);
      setShowCreatePost(false);
      
      toast({
        title: "Success! ✨",
        description: "Your spiritual post has been shared with the community."
      });
      
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const likePost = async (postId: string) => {
    try {
      // In a real app, you'd track user likes and update accordingly
      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
        const updatedPosts = [...posts];
        updatedPosts[postIndex].likes_count += 1;
        setPosts(updatedPosts);
      }
      
      toast({
        title: "🙏 Blessed!",
        description: "Your appreciation has been shared."
      });
      
    } catch (error) {
      console.error('Error liking post:', error);
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

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !filterTag || post.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  if (authLoading || loading) {
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-temple bg-clip-text text-transparent mb-2">
            Spiritual Community 👥
          </h1>
          <p className="text-muted-foreground">
            Share your spiritual journey and connect with fellow devotees
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Create Post */}
            <Card className="card-sacred">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
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
                        
                        <Button onClick={createPost} className="w-full">
                          <Send className="h-4 w-4 mr-2" />
                          Share with Community
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
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
                  </div>
                  <select
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="">All Topics</option>
                    {availableTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Posts */}
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="card-sacred hover:shadow-divine transition-all duration-300">
                  <CardContent className="p-6">
                    {/* User Info */}
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          U
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">
                          Anonymous Devotee
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

                    {/* Content */}
                    <div className="mb-4">
                      <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => likePost(post.id)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          <span>{post.likes_count}</span>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          <span>{post.comments_count}</span>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Share className="h-4 w-4 mr-1" />
                          <span>{post.shares_count}</span>
                        </Button>
                      </div>
                    </div>
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
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Community Stats */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Community Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">1,247</div>
                  <p className="text-sm text-muted-foreground">Active Devotees</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">3,891</div>
                  <p className="text-sm text-muted-foreground">Spiritual Posts</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">12,567</div>
                  <p className="text-sm text-muted-foreground">Blessings Shared</p>
                </div>
              </CardContent>
            </Card>

            {/* Popular Tags */}
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

            {/* Community Guidelines */}
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