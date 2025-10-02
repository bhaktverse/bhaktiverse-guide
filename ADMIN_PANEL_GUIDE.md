# BhaktVerse Admin Panel Integration Guide

## 🎯 Overview

This guide helps you integrate the BhaktVerse Admin Panel ([https://github.com/bhaktverse/bhaktiverse-admin.git](https://github.com/bhaktverse/bhaktiverse-admin.git)) with your BhaktVerse frontend application for seamless content management.

---

## 📊 Database Schema Overview

### Core Tables

#### 1. **Saints Table**
```sql
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
```

**Admin Management:**
- Upload saint images to Supabase Storage (`saints-images` bucket)
- Add biographical information, teachings, and quotes
- Mark saints as verified after review
- Enable AI model fine-tuning flag for premium features

#### 2. **Scriptures Table**
```sql
CREATE TABLE scriptures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  tradition VARCHAR(255),
  language VARCHAR(10),
  type ENUM('scripture', 'commentary', 'devotional', 'philosophical', 'mantra'),
  total_chapters INTEGER,
  description TEXT,
  summary TEXT,
  pdf_url TEXT,
  audio_url TEXT,
  difficulty_level ENUM('beginner', 'intermediate', 'advanced'),
  estimated_reading_time INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Admin Management:**
- Upload PDF files to `scriptures-pdfs` bucket
- Upload audio narrations to `scriptures-audio` bucket
- Organize content by tradition and difficulty level
- Track chapter count and reading time estimates

#### 3. **Scripture Chapters Table**
```sql
CREATE TABLE scripture_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scripture_id UUID REFERENCES scriptures(id),
  chapter_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  verse_count INTEGER DEFAULT 0,
  audio_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Admin Management:**
- Add chapters sequentially with proper numbering
- Include chapter summaries for quick reference
- Upload chapter-specific audio files
- Track verse counts per chapter

#### 4. **Audio Library Table**
```sql
CREATE TABLE audio_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255),
  category VARCHAR(255) NOT NULL, -- 'mantra', 'bhajan', 'aarti', 'meditation', 'story', 'discourse'
  duration INTEGER NOT NULL,
  language VARCHAR(10) NOT NULL,
  audio_url TEXT NOT NULL,
  lyrics TEXT,
  meaning TEXT,
  pronunciation_guide TEXT,
  associated_deity VARCHAR(255),
  occasion JSONB DEFAULT '[]',
  difficulty_level VARCHAR(50) DEFAULT 'beginner',
  download_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Admin Management:**
- Upload audio files to `audio-library` bucket
- Categorize audio by type (mantra, bhajan, aarti, etc.)
- Add lyrics, meanings, and pronunciation guides
- Associate with deities and special occasions
- Monitor download counts and ratings

#### 5. **Temples Table**
```sql
CREATE TABLE temples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  location JSONB NOT NULL, -- {lat, lng, address, city, state, country}
  primary_deity VARCHAR(255),
  tradition VARCHAR(255),
  description TEXT,
  history TEXT,
  visiting_hours JSONB,
  contact_info JSONB,
  live_darshan_url TEXT,
  darshan_schedule JSONB,
  facilities JSONB DEFAULT '[]',
  entrance_fee JSONB,
  image_urls JSONB DEFAULT '[]',
  rating NUMERIC(3,2) DEFAULT 0.00,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Admin Management:**
- Upload multiple temple images to `temple-images` bucket
- Add accurate location data with coordinates
- Set up live darshan streaming URLs (YouTube/custom)
- Manage visiting hours and schedules
- Verify temple information for authenticity

#### 6. **Calendar Events Table**
```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  event_type ENUM('festival', 'aarti', 'puja', 'vrat', 'utsav') NOT NULL,
  date DATE NOT NULL,
  time TIME,
  duration_hours INTEGER DEFAULT 1,
  description TEXT,
  significance TEXT,
  reminder_enabled BOOLEAN DEFAULT true,
  regional_significance JSONB DEFAULT '[]',
  rituals JSONB DEFAULT '[]',
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Admin Management:**
- Schedule festivals according to Hindu calendar
- Add Panchang data and muhurat times
- Set up automatic recurring events
- Regional variations and significance notes
- Enable push notification reminders

#### 7. **Community Posts Table**
```sql
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]',
  post_type ENUM('text', 'image', 'video', 'audio', 'experience', 'question'),
  tags JSONB DEFAULT '[]',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  visibility ENUM('public', 'followers', 'private') DEFAULT 'public',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Admin Management:**
- Moderate community content
- Feature high-quality posts
- Manage inappropriate content flags
- Track engagement metrics
- Promote positive spiritual discussions

---

## 🔐 Supabase Storage Buckets Setup

### Create Required Buckets

```sql
-- Saints Images
INSERT INTO storage.buckets (id, name, public) VALUES ('saints-images', 'saints-images', true);

-- Scriptures PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('scriptures-pdfs', 'scriptures-pdfs', true);

-- Scriptures Audio
INSERT INTO storage.buckets (id, name, public) VALUES ('scriptures-audio', 'scriptures-audio', true);

-- Audio Library
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-library', 'audio-library', true);

-- Temple Images
INSERT INTO storage.buckets (id, name, public) VALUES ('temple-images', 'temple-images', true);

-- Community Media
INSERT INTO storage.buckets (id, name, public) VALUES ('community-media', 'community-media', true);
```

### Storage Policies

```sql
-- Public read access for all buckets
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN (
  'saints-images', 'scriptures-pdfs', 'scriptures-audio', 
  'audio-library', 'temple-images'
));

-- Admin upload access
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT 
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

-- Admin update/delete access
CREATE POLICY "Admin Manage" ON storage.objects FOR UPDATE 
USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);
```

---

## 👥 Admin Role Management

### Create Admin Role System

```sql
-- Create role enum
CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Grant admin to your user
INSERT INTO user_roles (user_id, role) 
VALUES ('YOUR_USER_ID', 'admin');
```

---

## 🔧 Admin Panel Features

### 1. **Content Management Dashboard**
- View all content in tabular format
- Bulk upload capabilities
- Quick edit/delete actions
- Content status tracking (draft/published)

### 2. **Media Upload System**
- Drag-and-drop file uploads
- Image compression and optimization
- Audio file transcoding
- PDF processing and indexing
- Thumbnail generation

### 3. **Analytics Dashboard**
- User engagement metrics
- Content popularity tracking
- Download statistics
- Regional usage patterns
- Peak usage times

### 4. **Moderation Tools**
- Community post review queue
- User report management
- Content flagging system
- Automated spam detection
- Ban/warning system

### 5. **SEO & Metadata Management**
- Meta tags for all content
- Open Graph images
- Schema.org structured data
- Sitemap generation
- Search optimization

---

## 🚀 Admin Panel Setup Instructions

### Step 1: Clone Admin Repository

```bash
git clone https://github.com/bhaktverse/bhaktiverse-admin.git
cd bhaktiverse-admin
```

### Step 2: Environment Configuration

Create `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://rbdbrbijgehakdsmnccm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin Panel Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_FRONTEND_URL=https://your-bhaktverse-app.com

# OpenAI for AI Features (optional)
OPENAI_API_KEY=your_openai_key

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### Step 3: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 4: Run Admin Panel

```bash
npm run dev
# or
yarn dev
```

Access at: `http://localhost:3000/admin`

---

## 📝 Content Upload Workflows

### Upload Saints

1. Navigate to "Saints Management"
2. Click "Add New Saint"
3. Fill in details:
   - Name (required)
   - Tradition
   - Birth/Death years
   - Biography
   - Key teachings
   - Famous quotes (JSON array)
4. Upload saint image (recommended: 400x400px, JPG/PNG)
5. Mark as verified after review
6. Enable AI fine-tuning if applicable
7. Click "Save & Publish"

### Upload Scriptures

1. Navigate to "Scriptures Management"
2. Click "Add New Scripture"
3. Fill in details:
   - Title, Author, Tradition
   - Type and difficulty level
   - Description and summary
4. Upload PDF (recommended: optimized, searchable)
5. Add chapters:
   - Click "Add Chapter"
   - Enter chapter details
   - Upload chapter audio (optional)
6. Set estimated reading time
7. Click "Save & Publish"

### Upload Audio

1. Navigate to "Audio Library"
2. Click "Upload Audio"
3. Select category (mantra/bhajan/aarti/etc.)
4. Upload audio file (MP3, 128-320kbps)
5. Fill in metadata:
   - Title, Artist
   - Lyrics (Sanskrit/Hindi)
   - Meaning (English)
   - Pronunciation guide
6. Associate with deity/occasion
7. Click "Save & Publish"

### Add Temples

1. Navigate to "Temples Management"
2. Click "Add New Temple"
3. Fill in basic info:
   - Name, Primary deity
   - Tradition
   - Description and history
4. Add location:
   - Use map picker for coordinates
   - Enter full address
5. Upload multiple images (gallery)
6. Add visiting hours and schedule
7. If available, add live darshan URL
8. List facilities and entrance fees
9. Mark as verified
10. Click "Save & Publish"

### Schedule Events

1. Navigate to "Calendar Management"
2. Click "Add Event"
3. Select event type (festival/aarti/puja/vrat)
4. Set date and time
5. Add description and significance
6. Configure:
   - Duration
   - Recurring pattern (if applicable)
   - Regional variations
   - Rituals and customs
7. Enable reminders
8. Click "Save & Publish"

---

## 🔄 Data Synchronization

### Real-time Updates

The admin panel uses Supabase Realtime for instant synchronization:

```typescript
// Example: Listen to saints table changes
const subscription = supabase
  .channel('saints-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'saints' },
    (payload) => {
      console.log('Saints updated:', payload);
      // Refresh data in admin UI
    }
  )
  .subscribe();
```

### Batch Operations

For bulk uploads, use the admin panel's CSV import:

1. Download template CSV
2. Fill in data
3. Upload CSV file
4. Review and confirm changes
5. Process batch import

---

## 📊 Admin Analytics

### Key Metrics to Monitor

1. **Content Metrics**
   - Total saints, scriptures, audio tracks
   - Content upload velocity
   - Popular content (views, downloads)

2. **User Engagement**
   - Daily/weekly active users
   - Average session duration
   - Feature usage patterns

3. **Performance**
   - Page load times
   - API response times
   - Error rates

4. **Storage Usage**
   - Total storage consumed
   - Bucket-wise breakdown
   - Media optimization opportunities

---

## 🛡️ Security Best Practices

1. **Never expose service role key** in frontend code
2. **Use Row Level Security (RLS)** for all tables
3. **Implement admin authentication** with MFA
4. **Audit log all admin actions** for accountability
5. **Regular backups** of database and storage
6. **Rate limiting** on admin API endpoints
7. **Content moderation** before public visibility
8. **Secure file uploads** with virus scanning

---

## 🐛 Troubleshooting

### Common Issues

**Issue: Images not displaying**
- Check storage bucket is public
- Verify file URL format
- Check CORS settings

**Issue: Audio not playing**
- Verify audio file format (MP3 recommended)
- Check file size (<50MB)
- Ensure proper MIME type

**Issue: Admin can't upload**
- Verify admin role assignment
- Check storage policies
- Review RLS policies

**Issue: Real-time not working**
- Enable Realtime in Supabase dashboard
- Check channel subscriptions
- Verify database triggers

---

## 📞 Support & Resources

- **Frontend App**: https://your-bhaktverse-app.com
- **Admin Panel**: https://admin.bhaktverse.com
- **Supabase Dashboard**: https://supabase.com/dashboard/project/rbdbrbijgehakdsmnccm
- **GitHub Issues**: https://github.com/bhaktverse/bhaktiverse-admin/issues
- **Documentation**: https://docs.bhaktverse.com
- **Support Email**: admin@bhaktverse.com

---

## 🎯 Next Steps

1. Set up admin user roles
2. Configure storage buckets
3. Upload initial content (10+ items per category)
4. Test all features in staging environment
5. Enable real-time synchronization
6. Set up monitoring and alerts
7. Train content moderators
8. Launch admin panel to production

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintained by**: BhaktVerse Team