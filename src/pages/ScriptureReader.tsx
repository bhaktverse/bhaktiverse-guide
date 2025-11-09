import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import Navigation from "@/components/Navigation";
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Volume2, 
  Type, 
  Bookmark, 
  Share, 
  Settings,
  ArrowLeft
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Scripture {
  id: string;
  title: string;
  author?: string;
  tradition?: string;
  language: string;
  type: string;
  total_chapters: number;
  difficulty_level: string;
  estimated_reading_time?: number;
  description?: string;
  summary?: string;
  pdf_url?: string;
  audio_url?: string;
}

interface Chapter {
  id: number;
  title: string;
  content: string;
  verse_count: number;
}

const ScriptureReader = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { scriptureId } = useParams();
  const [scripture, setScripture] = useState<Scripture | null>(null);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [readingProgress, setReadingProgress] = useState(0);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [pageMode, setPageMode] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && scriptureId) {
      loadScripture();
      loadChapters();
    }
  }, [user, scriptureId]);

  const loadScripture = async () => {
    try {
      const { data, error } = await supabase
        .from('scriptures')
        .select('*')
        .eq('id', scriptureId)
        .single();

      if (error) {
        console.error('Error loading scripture:', error);
        navigate('/scriptures');
        return;
      }

      setScripture(data);
    } catch (error) {
      console.error('Error loading scripture:', error);
      navigate('/scriptures');
    } finally {
      setLoading(false);
    }
  };

  const loadChapters = async () => {
    try {
      // Load chapters from database
      const { data, error } = await supabase
        .from('scripture_chapters')
        .select('*')
        .eq('scripture_id', scriptureId)
        .order('chapter_number');

      if (error) throw error;

      if (data && data.length > 0) {
        const dbChapters: Chapter[] = data.map(ch => ({
          id: ch.chapter_number,
          title: ch.title,
          content: ch.content,
          verse_count: ch.verse_count || 0
        }));
        setChapters(dbChapters);
        // Restore last position
        const saved = localStorage.getItem(`bv:scripture:${scriptureId}:chapter`);
        if (saved) setCurrentChapter(parseInt(saved, 10));
      } else {
        // Generate sample chapters if no data in database
        const sampleChapters: Chapter[] = [];
        const totalChapters = scripture?.total_chapters || 18;
        
        for (let i = 1; i <= totalChapters; i++) {
          sampleChapters.push({
            id: i,
            title: `Chapter ${i}`,
            content: `This is the content of Chapter ${i}. Here you would find the actual verses and teachings from the sacred text. The wisdom contained within these ancient words has guided countless souls on their spiritual journey.\n\nEach verse contains profound meaning that reveals deeper truths about existence, dharma, and the path to liberation.`,
            verse_count: Math.floor(Math.random() * 50) + 10
          });
        }
        setChapters(sampleChapters);
      }
    } catch (error) {
      console.error('Error loading chapters:', error);
    }
  };

  const handleChapterChange = async (chapterNum: number) => {
    if (chapterNum >= 1 && chapterNum <= chapters.length) {
      setCurrentChapter(chapterNum);
      localStorage.setItem(`bv:scripture:${scriptureId}:chapter`, String(chapterNum));
      const percent = chapters.length > 0 ? Math.round((chapterNum - 1) / chapters.length * 100) : 0;
      setReadingProgress(percent);
      // Persist progress for authenticated users
      try {
        if (user && scripture) {
          await supabase.from('user_progress').upsert({
            user_id: user.id,
            content_id: scripture.id,
            content_type: 'scripture',
            progress_percentage: percent,
            last_position: chapterNum,
            completed: chapterNum >= chapters.length
          });
        }
      } catch (e) {
        console.warn('Could not persist reading progress', e);
      }
    }
  };

  const toggleAudioPlayback = async () => {
    const audio = audioRef.current;
    if (!audio && scripture?.audio_url) {
      // lazily create the element
      const el = new Audio(scripture.audio_url);
      audioRef.current = el;
    }
    try {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          await audioRef.current.play();
          setIsPlaying(true);
        }
      }
    } catch (err) {
      console.error('Scripture audio playback error:', err);
      setIsPlaying(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-peace flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-om-pulse">📖</div>
          <p className="text-muted-foreground">Loading sacred text...</p>
        </div>
      </div>
    );
  }

  if (!scripture) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="card-sacred">
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Scripture Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The requested scripture could not be found.
            </p>
            <Button onClick={() => navigate('/scriptures')}>
              Back to Scriptures
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentChapterData = chapters.find(c => c.id === currentChapter);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/scriptures')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Scriptures
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-temple bg-clip-text text-transparent">
                {scripture.title}
              </h1>
              {scripture.author && (
                <p className="text-muted-foreground">by {scripture.author}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2 mt-2 md:mt-0">
              {scripture.tradition && (
                <Badge variant="outline">{scripture.tradition}</Badge>
              )}
              <Badge className="bg-gradient-saffron text-primary-foreground">
                {scripture.difficulty_level}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Chapter Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="card-sacred sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Chapters</CardTitle>
                <CardDescription>
                  {chapters.length} chapters • {scripture.estimated_reading_time ? `${Math.floor(scripture.estimated_reading_time / 60)}h ${scripture.estimated_reading_time % 60}m` : 'Time varies'}
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {chapters.map((chapter) => (
                    <Button
                      key={chapter.id}
                      variant={currentChapter === chapter.id ? "default" : "ghost"}
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => handleChapterChange(chapter.id)}
                    >
                      <div>
                        <div className="font-medium">{chapter.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {chapter.verse_count} verses
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Reading Controls */}
            <Card className="card-sacred mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                  {/* Chapter Navigation */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleChapterChange(currentChapter - 1)}
                      disabled={currentChapter <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <span className="text-sm font-medium px-4">
                      Chapter {currentChapter} of {chapters.length}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleChapterChange(currentChapter + 1)}
                      disabled={currentChapter >= chapters.length}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Reading Tools */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Audio Controls */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleAudioPlayback}
                      disabled={!scripture?.audio_url}
                      title={scripture?.audio_url ? 'Play/Pause audio narration' : 'No audio available'}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    
                    {/* Font Size */}
                    <div className="flex items-center space-x-2">
                      <Type className="h-4 w-4" />
                      <Slider
                        value={[fontSize]}
                        onValueChange={(value) => setFontSize(value[0])}
                        max={24}
                        min={12}
                        step={2}
                        className="w-24"
                      />
                    </div>

                    {/* Theme */}
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}>Light</Button>
                      <Button size="sm" variant={theme === 'sepia' ? 'default' : 'outline'} onClick={() => setTheme('sepia')}>Sepia</Button>
                      <Button size="sm" variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}>Dark</Button>
                    </div>

                    {/* Page Mode */}
                    <Button size="sm" variant={pageMode ? 'default' : 'outline'} onClick={() => setPageMode(!pageMode)}>
                      Book Mode
                    </Button>

                    {/* Action Buttons */}
                    <Button variant="outline" size="sm">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Reading Progress</span>
                    <span>{readingProgress}% complete</span>
                  </div>
                  <Progress value={readingProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Chapter Content */}
            <Card className="card-sacred">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {currentChapterData?.title}
                </CardTitle>
                <CardDescription>
                  {currentChapterData?.verse_count} verses
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div 
                  className={
                    `prose prose-lg max-w-none leading-relaxed rounded-xl p-6 shadow-divine ${
                      theme === 'sepia' ? 'bg-amber-50 dark:bg-amber-900/10' : theme === 'dark' ? 'bg-background' : 'bg-white'
                    } ${pageMode ? 'md:columns-2 gap-12' : ''}`
                  }
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <div className="space-y-6 text-foreground">
                    {currentChapterData?.content.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="leading-8">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Chapter Navigation Footer */}
                <div className="flex justify-between items-center mt-12 pt-6 border-t border-border/50">
                  <Button
                    variant="outline"
                    onClick={() => handleChapterChange(currentChapter - 1)}
                    disabled={currentChapter <= 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous Chapter
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">
                    Chapter {currentChapter} of {chapters.length}
                  </span>
                  
                  <Button
                    onClick={() => handleChapterChange(currentChapter + 1)}
                    disabled={currentChapter >= chapters.length}
                  >
                    Next Chapter
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptureReader;