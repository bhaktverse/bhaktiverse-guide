# 🎵 Audio Library Administration Guide

## Current Status
✅ Audio library storage bucket created and configured
✅ Public access enabled for audio playback
✅ 12 demo tracks loaded with working URLs
✅ Enhanced audio player with error handling

## Audio Database Structure

The `audio_library` table contains spiritual audio content with these key fields:
- `id` - Unique identifier
- `title` - Track name
- `artist` - Performer/creator
- `category` - Type (mantra, bhajan, aarti, meditation, stotram, devotional, vandana)
- `audio_url` - Direct URL to audio file
- `lyrics` - Sanskrit/Hindi lyrics
- `meaning` - English translation
- `pronunciation_guide` - Phonetic guide
- `duration` - Length in seconds
- `language` - Track language (hi, sa, en)
- `associated_deity` - Related deity
- `difficulty_level` - beginner/intermediate/advanced
- `rating` - User rating (0-5)
- `download_count` - Popularity metric

## Uploading Your Own Spiritual Audio

### Method 1: Upload to Supabase Storage

1. **Access Storage Dashboard**
   - Visit: https://supabase.com/dashboard/project/rbdbrbijgehakdsmnccm/storage/buckets/audio-library
   - Click "Upload Files"

2. **Prepare Audio Files**
   - Format: MP3 (recommended), OGG, or WAV
   - Bitrate: 128kbps or higher
   - Max size: 50MB per file
   - Naming: Use descriptive names (e.g., `gayatri-mantra-pandit-jasraj.mp3`)

3. **Upload Files**
   - Drag & drop or select files
   - Files will be publicly accessible at:
     `https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/audio-library/[filename]`

4. **Add Database Entry**
   ```sql
   INSERT INTO audio_library (
     title, artist, category, duration, language, 
     audio_url, lyrics, meaning, associated_deity, difficulty_level
   ) VALUES (
     'Gayatri Mantra',
     'Pandit Jasraj',
     'mantra',
     180,
     'sa',
     'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/audio-library/gayatri-mantra.mp3',
     'Om Bhur Bhuvaḥ Swaḥ...',
     'We meditate on the glory of the Creator',
     'Savitr',
     'beginner'
   );
   ```

### Method 2: Use External URLs

If you have audio hosted elsewhere (YouTube, Archive.org, etc.):

```sql
UPDATE audio_library 
SET audio_url = 'https://your-audio-source.com/track.mp3'
WHERE id = '[track-id]';
```

## Current Demo Tracks

The platform now has 12 working demo tracks:
1. **Gayatri Mantra** - Internet Archive
2. **Mahamrityunjaya Mantra** - Internet Archive  
3. **Hanuman Chalisa** - Internet Archive
4. **Om Namah Shivaya** - Internet Archive
5-12. **Various Devotional Music** - SoundHelix demos

## Categories Explained

- **mantra** 📿 - Sacred chants (Om, Gayatri, etc.)
- **bhajan** 🎵 - Devotional songs
- **aarti** 🪔 - Evening worship songs
- **meditation** 🧘‍♀️ - Instrumental meditation music
- **stotram** 📜 - Vedic hymns
- **devotional** 🙏 - General devotional content
- **vandana** 🌺 - Prayer songs

## Best Practices

### Audio Quality
- **Bitrate**: 128-320 kbps MP3
- **Sample Rate**: 44.1 kHz or 48 kHz
- **Mono vs Stereo**: Stereo for music, mono for chants (optional)
- **Normalization**: Ensure consistent volume levels

### Metadata Accuracy
- Include accurate duration
- Add complete lyrics with proper Sanskrit/Hindi spelling
- Provide meaningful English translations
- Specify correct deity associations
- Set appropriate difficulty levels

### Content Guidelines
- Authentic spiritual content only
- Respect copyright laws
- Credit original artists properly
- Include pronunciation guides for mantras
- Add cultural context in the meaning field

## Troubleshooting

### Audio Won't Play
1. Check if file exists at the URL
2. Verify CORS headers allow playback
3. Ensure bucket is public
4. Test URL in browser directly
5. Check file format compatibility (MP3/OGG/WAV)

### Storage Issues
- **Access Denied**: Verify RLS policy exists
- **File Too Large**: Compress or split files
- **Upload Failed**: Check network connection
- **Wrong Format**: Convert to MP3

## Adding Bulk Content

Use SQL for bulk uploads:

```sql
INSERT INTO audio_library (title, artist, category, duration, language, audio_url) VALUES
('Track 1', 'Artist 1', 'mantra', 300, 'sa', 'https://...'),
('Track 2', 'Artist 2', 'bhajan', 240, 'hi', 'https://...'),
('Track 3', 'Artist 3', 'aarti', 180, 'hi', 'https://...');
```

## User Features

The audio player includes:
- ▶️ Play/Pause controls
- ⏭️ Next/Previous track navigation
- 🔀 Shuffle playlist
- 🔁 Repeat mode (one/all)
- 📊 Progress bar with seek
- 🔊 Volume control
- 📱 Mobile-responsive design
- ❤️ Like/favorite tracks
- 📥 Download functionality
- 📖 Lyrics display
- 🎯 Pronunciation guide

## Future Enhancements

Consider adding:
- Text-to-speech for scripture readings
- AI-powered pronunciation feedback
- Personalized recommendations
- Offline download capability
- Custom playlists
- Audio quality selection
- Playback speed control
- Sleep timer
- Background playback
- Casting support

## Support Resources

- **Storage Dashboard**: https://supabase.com/dashboard/project/rbdbrbijgehakdsmnccm/storage/buckets
- **SQL Editor**: https://supabase.com/dashboard/project/rbdbrbijgehakdsmnccm/sql/new
- **Audio Library Page**: `/audio-library-guide`

---

**Note**: The current demo tracks use public domain sources. Replace them with authentic spiritual audio for production use. Always respect copyright and properly credit content creators.
