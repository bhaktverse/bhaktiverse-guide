-- Ensure audio-library storage bucket exists with public access
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-library', 'audio-library', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policy if it exists and recreate
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public Access to Audio Library" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create RLS policy for public read access to audio files
CREATE POLICY "Public Access to Audio Library"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-library');

-- Update audio URLs to use working demo sources
-- Using Internet Archive's public domain audio files and SoundHelix demos
UPDATE audio_library SET audio_url = 'https://archive.org/download/GayatriMantra_201805/Gayatri%20Mantra.mp3'
WHERE id = 'e8fa017e-5539-4de9-a240-b3e7fca321cc';

UPDATE audio_library SET audio_url = 'https://archive.org/download/MahaMrityunjayaMantra/Maha%20Mrityunjaya%20Mantra.mp3'
WHERE id = '1a645a48-78ce-4aca-85d5-4056d3211eba';

UPDATE audio_library SET audio_url = 'https://archive.org/download/HanumanChalisaByGulshan_201805/Hanuman%20Chalisa.mp3'
WHERE id = 'd00ee794-aadf-43e4-97e6-f32e32c91bd8';

UPDATE audio_library SET audio_url = 'https://archive.org/download/OmNamahShivaya_201910/Om%20Namah%20Shivaya.mp3'
WHERE id = '28946787-0d95-40a2-9899-66d105874820';

UPDATE audio_library SET audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
WHERE id = '1d0cc4b3-11ce-419c-9aea-ef02e904782c';

UPDATE audio_library SET audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
WHERE id = '9d03f137-6c76-40cc-ae58-42b307e65b60';

UPDATE audio_library SET audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
WHERE id = '9201637a-dc10-441c-a583-ffa5d2ab9b59';

UPDATE audio_library SET audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
WHERE id = '3f96a027-3f65-4876-afa7-76dddf113b19';

UPDATE audio_library SET audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
WHERE id = 'd89349b6-ce92-4309-a9f0-ba7b2f76b4fb';

UPDATE audio_library SET audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
WHERE id = 'a3d0dd6a-65b9-44b4-bb64-9b2e47562d11';

UPDATE audio_library SET audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'
WHERE id = 'f9cd83e6-704b-48c4-8a52-b468da7aab05';

UPDATE audio_library SET audio_url = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
WHERE id = 'a8f89503-17f3-4181-9e6d-d66699570da3';