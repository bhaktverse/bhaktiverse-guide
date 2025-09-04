# BhaktVerse Backend Integration Guide

## 🎯 Overview
This document helps backend developers understand the current frontend architecture and integrate with the same Supabase database to create a separate backend service.

## 🏗️ Current Frontend Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui components  
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **State Management**: React hooks + Tanstack Query
- **Routing**: React Router DOM

### Supabase Configuration
```typescript
// Current Supabase connection
const SUPABASE_URL = "https://rbdbrbijgehakdsmnccm.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZGJyYmlqZ2VoYWtkc21uY2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjYzMjYsImV4cCI6MjA3MjMwMjMyNn0.Mr__j2FL8ZrJz9lj40iIobKxBw3GfOFI4zO0XBn8pQE"
const PROJECT_ID = "rbdbrbijgehakdsmnccm"
```

## 📊 Database Schema

### Current Tables & Structure

#### 1. User Management
```sql
-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    preferred_language VARCHAR(10) DEFAULT 'hi',
    spiritual_level spiritual_level DEFAULT 'beginner',
    favorite_deities JSONB DEFAULT '[]',
    daily_goals JSONB DEFAULT '{"mantras": 108, "reading_minutes": 15, "meditation_minutes": 10}',
    streak_data JSONB DEFAULT '{"current_streak": 0, "longest_streak": 0, "last_activity": null}',
    notification_preferences JSONB DEFAULT '{"aarti": true, "festivals": true, "reminders": true}',
    phone VARCHAR(15),
    location_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. Spiritual Content
```sql
-- Saints and spiritual leaders
CREATE TABLE saints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    regional_names JSONB DEFAULT '{}',
    birth_year INTEGER,
    death_year INTEGER,
    tradition VARCHAR(255),
    primary_language VARCHAR(10) DEFAULT 'hi',
    biography TEXT,
    key_teachings TEXT,
    famous_quotes JSONB DEFAULT '[]',
    image_url TEXT,
    audio_samples JSONB DEFAULT '[]',
    personality_traits JSONB DEFAULT '{}',
    verified BOOLEAN DEFAULT false,
    ai_model_fine_tuned BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Holy scriptures and texts
CREATE TABLE scriptures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    tradition VARCHAR(255),
    language VARCHAR(10) DEFAULT 'hi',
    type scripture_type DEFAULT 'scripture',
    total_chapters INTEGER DEFAULT 1,
    description TEXT,
    summary TEXT,
    pdf_url TEXT,
    audio_url TEXT,
    difficulty_level difficulty_level DEFAULT 'beginner',
    estimated_reading_time INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Spiritual content (teachings, quotes, etc.)
CREATE TABLE spiritual_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type content_source_type NOT NULL,
    source_id UUID,
    content_type content_type NOT NULL,
    category content_category NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    summary TEXT,
    tags JSONB DEFAULT '[]',
    language VARCHAR(10) DEFAULT 'hi',
    duration INTEGER,
    difficulty_level difficulty_level DEFAULT 'beginner',
    media_url TEXT,
    transcript TEXT,
    audio_pronunciation TEXT,
    related_content JSONB DEFAULT '[]',
    engagement_metrics JSONB DEFAULT '{"views": 0, "likes": 0, "shares": 0}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- FAQ system  
CREATE TABLE spiritual_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category faq_category NOT NULL,
    source_references JSONB DEFAULT '[]',
    difficulty_level difficulty_level DEFAULT 'beginner',
    language VARCHAR(10) DEFAULT 'hi',
    popularity_score INTEGER DEFAULT 0,
    ai_generated BOOLEAN DEFAULT true,
    verified_by_scholar BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Custom Enums
```sql
-- Spiritual levels
CREATE TYPE spiritual_level AS ENUM ('beginner', 'seeker', 'devotee', 'sage');

-- Content types
CREATE TYPE scripture_type AS ENUM ('scripture', 'commentary', 'devotional', 'philosophical', 'mantra');
CREATE TYPE content_source_type AS ENUM ('saint', 'scripture', 'youtube', 'book', 'audio', 'user_generated');
CREATE TYPE content_type AS ENUM ('text', 'audio', 'video', 'mantra', 'prayer');
CREATE TYPE content_category AS ENUM ('teaching', 'story', 'explanation', 'ritual', 'philosophy', 'devotional');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE faq_category AS ENUM ('rituals', 'philosophy', 'practices', 'festivals', 'mantras', 'meditation');
```

### Row Level Security (RLS) Policies
```sql
-- Profiles: Users can only access their own data
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public content: Read-only for authenticated users
CREATE POLICY "Saints are viewable by everyone" ON saints FOR SELECT USING (true);
CREATE POLICY "Scriptures are viewable by everyone" ON scriptures FOR SELECT USING (true);
CREATE POLICY "Spiritual content is viewable by everyone" ON spiritual_content FOR SELECT USING (true);
CREATE POLICY "FAQs are viewable by everyone" ON spiritual_faqs FOR SELECT USING (true);
```

## 🔌 Frontend API Integration Points

### Authentication Flow
```typescript
// Frontend auth implementation
import { supabase } from "@/integrations/supabase/client"

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "password123",
  options: {
    emailRedirectTo: `${window.location.origin}/`
  }
})

// Sign in  
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com", 
  password: "password123"
})

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Sign out
await supabase.auth.signOut()
```

### Data Fetching Patterns
```typescript
// Saints data
const { data: saints, error } = await supabase
  .from('saints')
  .select('*')
  .order('name')

// User profile
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', user.id)
  .single()

// Scriptures with pagination
const { data: scriptures, error } = await supabase
  .from('scriptures')
  .select('*')
  .range(0, 9)
  .order('created_at', { ascending: false })
```

## 🚀 Backend Integration Options

### Option 1: Direct Supabase Integration
Use the same Supabase instance with service role key for backend operations:

```javascript
// Backend Supabase client (Node.js/Python/Go/etc.)
const supabase = createClient(
  'https://rbdbrbijgehakdsmnccm.supabase.co',
  'SERVICE_ROLE_KEY', // Use service role key for backend
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Backend can perform admin operations
const { data, error } = await supabase
  .from('saints')
  .insert({
    name: 'New Saint',
    biography: 'Biography...',
    verified: true
  })
```

### Option 2: API Gateway Pattern
Create REST/GraphQL APIs that connect to the same Supabase database:

```javascript
// Express.js example
app.get('/api/saints', async (req, res) => {
  const { data, error } = await supabase
    .from('saints')
    .select('*')
  
  if (error) {
    return res.status(500).json({ error: error.message })
  }
  
  res.json(data)
})

app.post('/api/saints/:id/chat', async (req, res) => {
  // AI chat implementation
  const saintId = req.params.id
  const message = req.body.message
  
  // Get saint data
  const { data: saint } = await supabase
    .from('saints')
    .select('*')
    .eq('id', saintId)
    .single()
    
  // Process AI response...
})
```

## 🤖 AI Integration Requirements

### OpenAI Integration for Saint Chat
```javascript
// Backend AI service
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function chatWithSaint(saintId, message, chatHistory) {
  // Get saint personality
  const { data: saint } = await supabase
    .from('saints')
    .select('*')
    .eq('id', saintId)
    .single()
    
  const systemPrompt = `You are ${saint.name}, a spiritual saint from the ${saint.tradition} tradition. 
  Born in ${saint.birth_year}, you are known for: ${saint.key_teachings}
  
  Respond in character with wisdom and compassion. Your personality traits: ${JSON.stringify(saint.personality_traits)}`
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      ...chatHistory,
      { role: "user", content: message }
    ]
  })
  
  return completion.choices[0].message.content
}
```

### Text-to-Speech Integration
```javascript
// ElevenLabs TTS for Sanskrit/Hindi pronunciation
async function generateAudio(text, language = 'hi') {
  const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/voice_id', {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5
      }
    })
  })
  
  return response.arrayBuffer()
}
```

## 📱 Mobile App Considerations

### Capacitor Native Features
The frontend supports mobile apps via Capacitor with these native features:

- **Push Notifications**: For prayer reminders, festival alerts
- **Geolocation**: For nearby temple finder
- **Camera**: For temple visits, community posts  
- **Biometric Authentication**: Touch ID/Face ID for app access
- **Offline Storage**: Cached spiritual content
- **Background Audio**: Continuous mantra/meditation playback

### Mobile API Endpoints Needed
```javascript
// Location-based services
app.get('/api/temples/nearby', async (req, res) => {
  const { lat, lng, radius = 10 } = req.query
  // Return nearby temples
})

// Push notification triggers
app.post('/api/notifications/schedule', async (req, res) => {
  const { userId, type, scheduledTime } = req.body
  // Schedule notification (aarti reminders, festival alerts)
})

// Offline content sync
app.get('/api/content/sync', async (req, res) => {
  const { lastSync, userId } = req.query
  // Return updated content since lastSync
})
```

## 🔧 Backend Architecture Recommendations

### Microservices Structure
```
backend/
├── auth-service/          # User authentication & profiles
├── content-service/       # Saints, scriptures, spiritual content
├── ai-service/           # Saint chat, AI recommendations  
├── media-service/        # Audio/video processing, TTS
├── notification-service/ # Push notifications, reminders
├── analytics-service/    # User activity, progress tracking
└── gateway/             # API gateway, rate limiting
```

### Database Connection Examples

#### Node.js + Express
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default supabase
```

#### Python + FastAPI
```python
from supabase import create_client, Client
import os

supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_SERVICE_KEY")
)
```

#### Go
```go
import "github.com/supabase-community/supabase-go"

client := supabase.CreateClient(
    os.Getenv("SUPABASE_URL"),
    os.Getenv("SUPABASE_SERVICE_KEY"),
)
```

## 🔐 Security Considerations

### Environment Variables
```env
# Required for backend services
SUPABASE_URL=https://rbdbrbijgehakdsmnccm.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key

# Optional integrations
GOOGLE_CLOUD_API_KEY=your_google_key
YOUTUBE_API_KEY=your_youtube_key
```

### Rate Limiting
Implement rate limiting for AI chat endpoints:
```javascript
// Recommended limits
const rateLimits = {
  '/api/saints/*/chat': '10 requests/minute per user',
  '/api/ai/recommendations': '5 requests/minute per user',
  '/api/tts/generate': '20 requests/hour per user'
}
```

## 📊 Analytics & Monitoring

### Key Metrics to Track
- Daily active users
- Spiritual practice streaks  
- Content engagement (saints, scriptures)
- AI chat interactions
- Audio playback duration
- Temple visit check-ins

### Recommended Analytics Structure
```javascript
// User activity tracking
{
  userId: "uuid",
  activity: "mantra_chant",
  metadata: {
    mantra: "Om Namah Shivaya",
    count: 108,
    duration: 600, // seconds
    location: { lat: 28.6139, lng: 77.2090 }
  },
  timestamp: "2024-01-15T10:30:00Z"
}
```

## 🚀 Deployment Architecture

### Recommended Infrastructure
```yaml
# Docker Compose example
version: '3.8'
services:
  api-gateway:
    build: ./gateway
    ports: ["8080:8080"]
    
  auth-service:
    build: ./auth-service
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      
  ai-service:
    build: ./ai-service
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ELEVENLABS_API_KEY=${ELEVENLABS_API_KEY}
      
  redis:
    image: redis:alpine
    
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
```

## 📞 Frontend Communication

### Expected API Contracts
The frontend expects these API endpoints to maintain compatibility:

```typescript
// TypeScript interfaces the frontend uses
interface Saint {
  id: string
  name: string
  tradition: string
  biography: string
  key_teachings: string
  famous_quotes: string[]
  image_url?: string
  verified: boolean
  ai_model_fine_tuned: boolean
}

interface ChatMessage {
  id: string
  saint_id: string
  user_id: string
  message: string
  response: string
  timestamp: string
}

interface UserProfile {
  id: string
  user_id: string
  name: string
  spiritual_level: 'beginner' | 'seeker' | 'devotee' | 'sage'
  daily_goals: {
    mantras: number
    reading_minutes: number
    meditation_minutes: number
  }
  streak_data: {
    current_streak: number
    longest_streak: number
    last_activity: string | null
  }
}
```

## 🔄 Real-time Features

### WebSocket Connections
For real-time features like live darshan, group chanting:

```javascript
// WebSocket server for real-time features
io.on('connection', (socket) => {
  socket.on('join-darshan', ({ templeId }) => {
    socket.join(`temple-${templeId}`)
  })
  
  socket.on('join-chanting-circle', ({ circleId }) => {
    socket.join(`chanting-${circleId}`)
    // Synchronize mantra chanting across users
  })
})
```

This guide should help backend developers understand the current frontend architecture and integrate seamlessly with the same Supabase database while maintaining compatibility with the existing React frontend.