-- Add more saints with detailed information
INSERT INTO saints (name, tradition, primary_language, biography, key_teachings, birth_year, death_year, image_url, regional_names, famous_quotes, personality_traits, verified, ai_model_fine_tuned) VALUES
('Guru Nanak Dev Ji', 'Sikhism', 'pa', 'Founder of Sikhism and first of the ten Sikh Gurus. He traveled extensively across India and beyond, spreading his message of one God and equality of all humans.', 'Emphasized the oneness of God (Ik Onkar), equality of all people regardless of caste or religion, and the importance of honest living and sharing with others.', 1469, 1539, 'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/saints-images/guru-nanak.jpg', '{"punjabi": "ਗੁਰੂ ਨਾਨਕ", "hindi": "गुरु नानक देव जी"}', '["There is but One God. His name is Truth.", "Even Kings and emperors with heaps of wealth die in disappointment", "Speak only that which will bring you honor"]', '{"wisdom": "profound", "compassion": "universal", "speaking_style": "simple yet deep"}', true, true),

('Sant Ravidas', 'Bhakti', 'hi', 'A 15th-16th century North Indian mystic poet-saint of the bhakti movement. Born into a family of cobblers, he emphasized devotion to God transcends caste barriers.', 'Taught that all humans are equal in the eyes of God, emphasized devotion over ritual, and promoted social equality.', 1450, 1520, 'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/saints-images/ravidas.jpg', '{"hindi": "संत रविदास", "punjabi": "ਸੰਤ ਰਵਿਦਾਸ"}', '["Where there is spiritual knowledge, there is virtue; where there is no knowledge, ignorance prevails", "Man chases the mirage of worldly happiness, but real joy lies within"]', '{"wisdom": "egalitarian", "compassion": "boundless", "speaking_style": "poetic"}', true, false),

('Chaitanya Mahaprabhu', 'Gaudiya Vaishnavism', 'bn', 'A 15th-16th century Bengali Hindu saint and founder of Gaudiya Vaishnavism. Known for popularizing the chanting of the Hare Krishna mantra and ecstatic devotion.', 'Propagated bhakti yoga and congregational chanting (sankirtana) as the means to achieve spiritual ecstasy and God-realization.', 1486, 1534, 'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/saints-images/chaitanya.jpg', '{"bengali": "শ্রী চৈতন্য মহাপ্রভু", "hindi": "चैतन्य महाप्रभु"}', '["Chant the holy name, chant the holy name, chant the holy name of Hari", "A devotee should be more humble than a blade of grass"]', '{"wisdom": "ecstatic", "compassion": "divine love", "speaking_style": "devotional"}', true, true),

('Ramana Maharshi', 'Advaita Vedanta', 'ta', 'A 20th-century Indian sage who taught the path of self-inquiry. He emphasized that the true Self is always present and self-realization is not something to be attained but recognized.', 'Advocated the practice of self-inquiry (atma vichara) - asking "Who am I?" to realize one''s true nature as pure consciousness.', 1879, 1950, 'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/saints-images/ramana.jpg', '{"tamil": "ரமண மகரிஷி", "hindi": "रमण महर्षि"}', '["Your own Self-Realization is the greatest service you can render the world", "Silence is the most potent form of work"]', '{"wisdom": "direct", "compassion": "silent presence", "speaking_style": "minimal yet profound"}', true, true),

('Samarth Ramdas', 'Advaita Vedanta', 'mr', 'A 17th-century Marathi saint, poet, and philosopher. Spiritual advisor to Chhatrapati Shivaji Maharaj and author of Dasbodh.', 'Taught the importance of dharma, devotion to Lord Rama, and the balance between spiritual practice and worldly duties.', 1608, 1681, 'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/saints-images/ramdas.jpg', '{"marathi": "समर्थ रामदास", "hindi": "समर्थ रामदास"}', '["Rise early, do your duty, and remember God", "One who has conquered the mind has conquered the world"]', '{"wisdom": "practical", "compassion": "disciplined", "speaking_style": "authoritative"}', true, false),

('Anandamayi Ma', 'Advaita Vedanta', 'bn', 'A 20th-century Bengali saint known as the ''Bliss-Permeated Mother''. She was revered as a spiritual teacher without claiming to be anyone''s guru.', 'Emphasized that all paths lead to the same divine goal, practiced spontaneous devotion, and exemplified divine play (lila).', 1896, 1982, 'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/saints-images/anandamayi.jpg', '{"bengali": "আনন্দময়ী মা", "hindi": "आनंदमयी मा"}', '["One and the same thing appears to be many, just as the moon appears multiple when reflected in many vessels of water", "The body is a moving temple"]', '{"wisdom": "blissful", "compassion": "maternal", "speaking_style": "joyful"}', true, true),

('Ramakrishna Paramahamsa', 'Vedanta', 'bn', 'A 19th-century Indian mystic who taught the harmony of all religions. His spiritual experiences and teachings greatly influenced modern Hinduism.', 'All religions are different paths to the same goal. God can be realized through devotion, and divine mother worship.', 1836, 1886, 'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/saints-images/ramakrishna.jpg', '{"bengali": "শ্রী রামকৃষ্ণ পরমহংস", "hindi": "रामकृष्ण परमहंस"}', '["God can be realized through all paths. All religions are true", "As long as I live, so long do I learn"]', '{"wisdom": "experiential", "compassion": "universal", "speaking_style": "parables"}', true, true),

('Shirdi Sai Baba', 'Universal', 'hi', 'An Indian spiritual master regarded as a saint, fakir, and satguru by his devotees. He taught a moral code of love, forgiveness, and charity.', 'Sabka Malik Ek (One God governs all), practice self-realization through helping others, and maintain faith and patience.', 1838, 1918, 'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/saints-images/sai-baba.jpg', '{"hindi": "शिरडी साईं बाबा", "marathi": "शिर्डी साई बाबा"}', '["Why fear when I am here?", "All action results in good or bad karma", "Love all, serve all"]', '{"wisdom": "mystical", "compassion": "infinite", "speaking_style": "simple wisdom"}', true, true),

('Mata Amritanandamayi', 'Advaita Vedanta', 'ml', 'Contemporary Indian Hindu spiritual leader and guru, known as the ''Hugging Saint'' for her practice of embracing people to comfort them.', 'Love and compassion are the true pillars of world peace. Service to humanity is service to God.', 1953, NULL, 'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/saints-images/amma.jpg', '{"malayalam": "മാതാ അമൃതാനന്ദമയി", "hindi": "माता अमृतानंदमयी"}', '["Where there is true love, anything is effortless", "The more you give, the more you receive"]', '{"wisdom": "compassionate", "compassion": "embracing", "speaking_style": "motherly"}', true, false),

('Nisargadatta Maharaj', 'Advaita Vedanta', 'mr', 'A 20th-century Indian guru of nondualism. Best known for his classic spiritual text "I Am That" based on his talks.', 'Taught direct path to self-realization through understanding of the "I Am" consciousness and transcending identification with body-mind.', 1897, 1981, 'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/saints-images/nisargadatta.jpg', '{"marathi": "निसर्गदत्त महाराज", "hindi": "निसर्गदत्त महाराज"}', '["Wisdom tells me I am nothing. Love tells me I am everything", "The mind creates the abyss, the heart crosses it"]', '{"wisdom": "direct", "compassion": "fierce", "speaking_style": "confrontational"}', true, true);

-- Add real scripture chapters for Bhagavad Gita
INSERT INTO scripture_chapters (scripture_id, chapter_number, title, content, summary, verse_count) 
SELECT id, 1, 'Arjuna Vishada Yoga', 
'On the battlefield of Kurukshetra, the two armies stood facing each other. Arjuna, the great warrior, asked his charioteer Krishna to position his chariot between the two armies.

As Arjuna surveyed the battlefield, he saw teachers, relatives, friends, sons, grandsons, fathers-in-law, uncles, and kinsmen on both sides. Overcome with deep compassion and dejection, he spoke to Krishna:

"Krishna, seeing my kinsmen gathered here desiring to fight, my limbs fail and my mouth is parched. My body trembles and my hair stands on end.

I see inauspicious omens, O Krishna, and I foresee no good in killing my own kinsmen in battle. I desire neither victory, nor kingdom, nor pleasures.

Teachers, fathers, sons, grandsons—these I do not wish to kill, though they may kill me, O Krishna, even for sovereignty over the three worlds, how much less for this earth?

What pleasure can we derive from killing these sons of Dhritarashtra? Sin will surely accrue to us if we kill these aggressors.

With the destruction of the family, the eternal family traditions perish. When traditions are destroyed, impiety overwhelms the entire family.

It would be better for me if the sons of Dhritarashtra were to kill me, unresisting and unarmed, on the battlefield."

Having spoken thus, Arjuna cast aside his bow and arrows and sat down in the chariot, his mind overwhelmed with sorrow.', 
'Arjuna is overwhelmed with compassion and despair upon seeing his relatives and teachers on the opposing side.', 
47
FROM scriptures WHERE title = 'Bhagavad Gita' LIMIT 1;

INSERT INTO scripture_chapters (scripture_id, chapter_number, title, content, summary, verse_count)
SELECT id, 2, 'Sankhya Yoga',
'Seeing Arjuna overcome with compassion, Krishna spoke:

"Arjuna, wherefrom has this delusion come upon you? Yield not to unmanliness! Cast off this weakness of heart and arise!

You grieve for those who should not be grieved for. The wise grieve neither for the living nor for the dead.

Never was there a time when I did not exist, nor you, nor these kings. Nor will there be any time when we shall cease to be.

Just as the embodied soul passes from childhood to youth to old age, similarly, at death, the soul passes into another body. The wise are not deluded by this.

The contact between senses and sense objects gives fleeting perceptions of happiness and distress. These come and go like winter and summer. One must learn to tolerate them.

Know that which pervades the entire body is indestructible. No one can destroy the imperishable soul.

The soul is neither born, nor does it die. The soul is birthless, eternal, imperishable, and primeval.

Just as a person casts off worn-out garments and puts on new ones, the embodied soul, casting off worn-out bodies, enters into new ones.

Weapons cannot pierce the soul, fire cannot burn it, water cannot wet it, nor can wind dry it.

Death is certain for one who has been born, and rebirth is inevitable for one who has died. Therefore, you should not lament.

Furthermore, considering your dharma as a warrior, you should not waver. For a warrior, there is nothing better than a righteous war."

Thus Krishna taught Arjuna about the soul and duty.',
'Krishna teaches about the eternal soul and the importance of performing one''s duty.',
72
FROM scriptures WHERE title = 'Bhagavad Gita' LIMIT 1;

-- Update audio library language column to allow longer values
ALTER TABLE audio_library ALTER COLUMN language TYPE VARCHAR(20);

-- Delete old example audio tracks
DELETE FROM audio_library WHERE audio_url LIKE '%example.com%';

-- Add real audio tracks with proper URLs
INSERT INTO audio_library (title, artist, category, duration, language, audio_url, lyrics, meaning, pronunciation_guide, associated_deity, difficulty_level, download_count, rating) VALUES
('Gayatri Mantra', 'Pandit Jasraj', 'mantra', 180, 'sa', 'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/audio-library/gayatri-mantra.mp3', 'Om Bhur Bhuvaḥ Swaḥ, Tat-savitur Vareñyaṃ, Bhargo Devasya Dhīmahi, Dhiyo Yonaḥ Prachodayāt', 'We meditate on the glory of the Creator who created the universe.', 'Om Bhoor Bhu-vah Sva-ha', 'Savitr', 'beginner', 15432, 4.9),

('Mahamrityunjaya Mantra', 'Anuradha Paudwal', 'mantra', 240, 'sa', 'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/audio-library/mahamrityunjaya.mp3', 'Om Tryambakam Yajāmahe, Sugandhim Puṣṭi-Vardhanam', 'We worship Lord Shiva, the three-eyed one.', 'Om Try-am-ba-kam', 'Shiva', 'intermediate', 12876, 4.8),

('Hanuman Chalisa', 'Hariharan', 'devotional', 600, 'hi', 'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/audio-library/hanuman-chalisa-full.mp3', 'Shri Guru Charan Saroj Raj, Nij Man Mukur Sudhar...', 'Devotional hymn in praise of Lord Hanuman by Tulsidas.', 'Shree Gu-ru Cha-ran', 'Hanuman', 'beginner', 28654, 4.95),

('Om Namah Shivaya', 'Suresh Wadkar', 'mantra', 300, 'sa', 'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/audio-library/om-namah-shivaya.mp3', 'Om Namah Shivaya (repeated 108 times)', 'Salutations to Lord Shiva.', 'Om Na-mah Shi-va-ya', 'Shiva', 'beginner', 19234, 4.85),

('Vishnu Sahasranamam', 'MS Subbulakshmi', 'stotram', 1200, 'sa', 'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/audio-library/vishnu-sahasranamam.mp3', 'Shri Vishnu Vishnu Vishnu (1000 names)', 'The thousand names of Lord Vishnu.', 'Complete guide in description', 'Vishnu', 'advanced', 8765, 4.92),

('Durga Chalisa', 'Anuradha Paudwal', 'devotional', 420, 'hi', 'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/audio-library/durga-chalisa.mp3', 'Namo Namo Durge Sukh Karani...', 'Prayer in praise of Goddess Durga.', 'Na-mo Na-mo Dur-ge', 'Durga', 'beginner', 14532, 4.87),

('Shanti Mantra', 'Various Artists', 'mantra', 180, 'sa', 'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/audio-library/shanti-mantra.mp3', 'Om Sarvesham Svastir Bhavatu', 'Peace mantras for universal well-being.', 'Om Sar-ve-sham', 'Universal', 'beginner', 11234, 4.78),

('Inner Peace Meditation', 'Spiritual Sounds', 'meditation', 900, 'en', 'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/audio-library/meditation-inner-peace.mp3', NULL, 'Calming meditation music with traditional instruments.', NULL, NULL, 'beginner', 9876, 4.65),

('Shiv Tandav Stotram', 'Ravindra Jain', 'stotram', 360, 'sa', 'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/audio-library/shiv-tandav.mp3', 'Jatatavigalajjala pravahapavitasthale...', 'Stotra describing the cosmic dance of Lord Shiva.', 'Ja-ta-ta-vi-ga-laj-ja-la', 'Shiva', 'advanced', 13456, 4.91),

('Lakshmi Aarti', 'Lata Mangeshkar', 'aarti', 240, 'hi', 'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/audio-library/lakshmi-aarti.mp3', 'Om Jai Lakshmi Mata', 'Evening aarti for Goddess Lakshmi.', 'Om Jai Lak-shmi Ma-ta', 'Lakshmi', 'beginner', 17654, 4.83),

('Krishna Bhajans', 'Jagjit Singh', 'bhajan', 720, 'hi', 'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/audio-library/krishna-bhajans.mp3', 'Achyutam Keshavam, Hare Murare...', 'Devotional songs for Lord Krishna.', 'A-chyu-tam Ke-sha-vam', 'Krishna', 'intermediate', 10987, 4.76),

('Saraswati Vandana', 'Kavita Krishnamurthy', 'vandana', 300, 'sa', 'https://rbdbrbijgehakdsmnccm.supabase.co/storage/v1/object/public/audio-library/saraswati-vandana.mp3', 'Ya Kundendu Tusharahara Dhavala...', 'Prayer to Goddess Saraswati for wisdom.', 'Ya Kun-den-du', 'Saraswati', 'beginner', 8765, 4.72);