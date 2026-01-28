import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  ListMusic, 
  Trash2, 
  Play, 
  Edit2,
  Save,
  X,
  Music,
  Heart,
  Globe,
  Lock
} from 'lucide-react';

interface AudioTrack {
  id: string;
  title: string;
  artist?: string;
  category: string;
  duration: number;
  audio_url: string;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: string[];
  is_public: boolean;
  user_id: string;
  created_at: string;
}

interface PlaylistManagerProps {
  allTracks: AudioTrack[];
  onPlayPlaylist: (tracks: AudioTrack[]) => void;
}

const PlaylistManager: React.FC<PlaylistManagerProps> = ({ allTracks, onPlayPlaylist }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [newPlaylistIsPublic, setNewPlaylistIsPublic] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadPlaylists();
    }
  }, [user]);

  const loadPlaylists = async () => {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Safely parse tracks field
      const parsedPlaylists = (data || []).map(playlist => ({
        ...playlist,
        tracks: Array.isArray(playlist.tracks) ? playlist.tracks as string[] : []
      }));
      
      setPlaylists(parsedPlaylists);
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async () => {
    if (!user || !newPlaylistName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert({
          user_id: user.id,
          name: newPlaylistName.trim(),
          description: newPlaylistDescription.trim() || null,
          is_public: newPlaylistIsPublic,
          tracks: selectedTracks
        })
        .select()
        .single();

      if (error) throw error;

      setPlaylists(prev => [{ ...data, tracks: selectedTracks }, ...prev]);
      resetForm();
      toast({
        title: "🎵 Playlist Created!",
        description: `"${newPlaylistName}" has been created successfully.`,
      });
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast({
        title: "Error",
        description: "Failed to create playlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updatePlaylist = async () => {
    if (!editingPlaylist) return;

    try {
      const { error } = await supabase
        .from('playlists')
        .update({
          name: newPlaylistName.trim(),
          description: newPlaylistDescription.trim() || null,
          is_public: newPlaylistIsPublic,
          tracks: selectedTracks
        })
        .eq('id', editingPlaylist.id);

      if (error) throw error;

      setPlaylists(prev => prev.map(p => 
        p.id === editingPlaylist.id 
          ? { ...p, name: newPlaylistName, description: newPlaylistDescription, is_public: newPlaylistIsPublic, tracks: selectedTracks }
          : p
      ));
      resetForm();
      toast({
        title: "✨ Playlist Updated!",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      console.error('Error updating playlist:', error);
      toast({
        title: "Error",
        description: "Failed to update playlist.",
        variant: "destructive",
      });
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);

      if (error) throw error;

      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
      toast({
        title: "Playlist Deleted",
        description: "The playlist has been removed.",
      });
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast({
        title: "Error",
        description: "Failed to delete playlist.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setNewPlaylistName('');
    setNewPlaylistDescription('');
    setNewPlaylistIsPublic(false);
    setSelectedTracks([]);
    setShowCreateDialog(false);
    setEditingPlaylist(null);
  };

  const startEditing = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setNewPlaylistName(playlist.name);
    setNewPlaylistDescription(playlist.description || '');
    setNewPlaylistIsPublic(playlist.is_public);
    setSelectedTracks(playlist.tracks);
    setShowCreateDialog(true);
  };

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTracks(prev => 
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const playPlaylist = (playlist: Playlist) => {
    const playlistTracks = allTracks.filter(track => playlist.tracks.includes(track.id));
    if (playlistTracks.length > 0) {
      onPlayPlaylist(playlistTracks);
      toast({
        title: "▶️ Now Playing",
        description: `Playing "${playlist.name}" (${playlistTracks.length} tracks)`,
      });
    } else {
      toast({
        title: "Empty Playlist",
        description: "This playlist has no tracks.",
        variant: "destructive",
      });
    }
  };

  const getTrackById = (trackId: string) => allTracks.find(t => t.id === trackId);

  if (!user) {
    return (
      <Card className="card-sacred">
        <CardContent className="p-6 text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Login Required</h3>
          <p className="text-sm text-muted-foreground">
            Sign in to create and manage your playlists
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-sacred">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ListMusic className="h-5 w-5 text-primary" />
              My Playlists
            </CardTitle>
            <CardDescription>Create and manage your spiritual audio collections</CardDescription>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={(open) => {
            if (!open) resetForm();
            setShowCreateDialog(open);
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Playlist
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>
                  {editingPlaylist ? 'Edit Playlist' : 'Create New Playlist'}
                </DialogTitle>
                <DialogDescription>
                  {editingPlaylist 
                    ? 'Update your playlist details and tracks'
                    : 'Add a name and select tracks for your new playlist'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                <div className="space-y-3">
                  <Input
                    placeholder="Playlist name"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className="bg-background"
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={newPlaylistDescription}
                    onChange={(e) => setNewPlaylistDescription(e.target.value)}
                    className="bg-background resize-none"
                    rows={2}
                  />
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant={newPlaylistIsPublic ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewPlaylistIsPublic(true)}
                      className="gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      Public
                    </Button>
                    <Button
                      type="button"
                      variant={!newPlaylistIsPublic ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewPlaylistIsPublic(false)}
                      className="gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      Private
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    Select Tracks ({selectedTracks.length} selected)
                  </h4>
                  <ScrollArea className="h-[250px] rounded-md border p-2">
                    <div className="space-y-1">
                      {allTracks.map(track => (
                        <div
                          key={track.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            selectedTracks.includes(track.id)
                              ? 'bg-primary/20 border border-primary/30'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => toggleTrackSelection(track.id)}
                        >
                          <div className={`h-4 w-4 rounded border flex items-center justify-center ${
                            selectedTracks.includes(track.id)
                              ? 'bg-primary border-primary'
                              : 'border-muted-foreground'
                          }`}>
                            {selectedTracks.includes(track.id) && (
                              <span className="text-xs text-primary-foreground">✓</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{track.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {track.category}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button 
                  onClick={editingPlaylist ? updatePlaylist : createPlaylist}
                  disabled={!newPlaylistName.trim()}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {editingPlaylist ? 'Save Changes' : 'Create Playlist'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                <div className="h-10 w-10 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-8">
            <ListMusic className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">No Playlists Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first spiritual audio playlist
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Playlist
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {playlists.map(playlist => (
              <div
                key={playlist.id}
                className="group flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-all border border-transparent hover:border-border/50"
              >
                <div className="h-12 w-12 rounded-lg bg-gradient-temple flex items-center justify-center text-white shadow-divine">
                  <ListMusic className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{playlist.name}</h4>
                    {playlist.is_public ? (
                      <Globe className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {playlist.tracks.length} tracks
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => playPlaylist(playlist)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => startEditing(playlist)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => deletePlaylist(playlist.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaylistManager;
