import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { Music, Upload, Database, CheckCircle2, AlertCircle, Info } from "lucide-react";

const AudioLibraryGuide = () => {
  return (
    <div className="min-h-screen bg-gradient-peace">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🎵</div>
          <h1 className="text-4xl font-bold bg-gradient-temple bg-clip-text text-transparent mb-4">
            Audio Library Setup Guide
          </h1>
          <p className="text-muted-foreground">
            Complete guide to add spiritual audio content to BhaktVerse
          </p>
        </div>

        {/* Current Status */}
        <Alert className="mb-8 border-primary/50 bg-primary/10">
          <Info className="h-5 w-5" />
          <AlertDescription className="ml-2">
            <strong>Current Status:</strong> Audio library is using demo tracks. Follow the steps below to add real spiritual audio content.
          </AlertDescription>
        </Alert>

        {/* Step-by-Step Guide */}
        <div className="space-y-6">
          {/* Step 1 */}
          <Card className="card-sacred">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <CardTitle>Upload Audio Files to Supabase Storage</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                <p className="text-sm"><strong>A. Go to Supabase Dashboard:</strong></p>
                <ul className="list-disc list-inside text-sm space-y-2 ml-4">
                  <li>Navigate to Storage → Buckets → <code className="bg-background px-2 py-1 rounded">audio-library</code></li>
                  <li>The bucket is already created and publicly accessible</li>
                </ul>

                <p className="text-sm mt-4"><strong>B. Upload Your Audio Files:</strong></p>
                <ul className="list-disc list-inside text-sm space-y-2 ml-4">
                  <li>Click "Upload" button</li>
                  <li>Select your spiritual audio files (MP3, WAV, OGG)</li>
                  <li>Recommended naming: <code className="bg-background px-2 py-1 rounded">mantra-name.mp3</code></li>
                </ul>

                <p className="text-sm mt-4"><strong>C. Get Public URLs:</strong></p>
                <div className="bg-background p-3 rounded text-xs font-mono">
                  https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/audio-library/your-file.mp3
                </div>
              </div>

              <Badge variant="outline" className="mt-2">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Storage bucket is already configured
              </Badge>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="card-sacred">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <CardTitle>Add Audio Metadata to Database</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">After uploading audio files, add their details to the database:</p>
              
              <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                <p className="text-sm"><strong>SQL Example:</strong></p>
                <pre className="bg-background p-3 rounded text-xs overflow-x-auto">
{`INSERT INTO audio_library (
  title, 
  artist, 
  category, 
  duration, 
  language, 
  audio_url,
  lyrics,
  meaning,
  pronunciation_guide,
  associated_deity,
  difficulty_level
) VALUES (
  'Gayatri Mantra',
  'Pandit Jasraj',
  'mantra',
  180,
  'sanskrit',
  'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/audio-library/gayatri-mantra.mp3',
  'Om Bhur Bhuvaḥ Swaḥ...',
  'We meditate on the glory of the Creator',
  'Om Bhoor Bhu-vah Sva-ha',
  'Savitr',
  'beginner'
);`}
                </pre>
              </div>

              <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  <strong>Categories:</strong> mantra, bhajan, aarti, meditation, story, discourse, devotional, stotram
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="card-sacred">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <CardTitle>Test Audio Playback</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">Once audio files are uploaded and database entries created:</p>
              
              <ul className="list-disc list-inside text-sm space-y-2 ml-4">
                <li>Refresh the Audio Library page</li>
                <li>Your tracks should appear in the list</li>
                <li>Click on any track to start playback</li>
                <li>Check browser console for any errors</li>
              </ul>

              <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg mt-4">
                <p className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Audio player supports: MP3, WAV, OGG, M4A
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Sources */}
          <Card className="card-sacred">
            <CardHeader>
              <CardTitle>Recommended Spiritual Audio Sources</CardTitle>
              <CardDescription>
                Legal sources for spiritual audio content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-semibold">📚 Public Domain Sources:</p>
                <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                  <li>Internet Archive (archive.org) - Public domain recordings</li>
                  <li>Wikimedia Commons - Free spiritual audio</li>
                  <li>FreeSoundtrackMusic.com - Meditation music</li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">🎙️ Record Your Own:</p>
                <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                  <li>Record mantras and bhajans with local artists</li>
                  <li>Create guided meditation audio</li>
                  <li>Narrate spiritual stories and teachings</li>
                </ul>
              </div>

              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">
                  <strong>Copyright Notice:</strong> Only use audio for which you have proper rights or licenses.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="card-sacred">
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.open('https://supabase.com/dashboard/project/rbdbrbijgehakdsmnccm/storage/buckets', '_blank')}
              >
                <Upload className="h-4 w-4 mr-2" />
                Open Supabase Storage
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.open('https://supabase.com/dashboard/project/rbdbrbijgehakdsmnccm/editor', '_blank')}
              >
                <Database className="h-4 w-4 mr-2" />
                Open Database Editor
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/audio-library'}
              >
                <Music className="h-4 w-4 mr-2" />
                Go to Audio Library
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AudioLibraryGuide;
