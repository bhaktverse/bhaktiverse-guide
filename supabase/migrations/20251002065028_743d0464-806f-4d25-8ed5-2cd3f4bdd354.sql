-- Fix session_type enum to include saint_specific
ALTER TYPE session_type ADD VALUE IF NOT EXISTS 'saint_specific';

-- Add real multilingual scripture data
INSERT INTO scriptures (
  title,
  author,
  tradition,
  language,
  type,
  total_chapters,
  difficulty_level,
  estimated_reading_time,
  description,
  summary
) VALUES
-- Hindi Scriptures
(
  'श्रीमद्भगवद्गीता',
  'व्यास',
  'वैष्णववाद',
  'hi',
  'scripture',
  18,
  'intermediate',
  720,
  'युद्ध के मैदान में अर्जुन और भगवान कृष्ण के बीच का शाश्वत संवाद। धर्म, कर्तव्य और मोक्ष का मार्ग।',
  'कुरुक्षेत्र के युद्धभूमि में अर्जुन और कृष्ण के बीच दार्शनिक संवाद जो जीवन के नैतिक और आध्यात्मिक संघर्षों को संबोधित करता है।'
),
(
  'श्री रामचरितमानस',
  'तुलसीदास',
  'वैष्णववाद',
  'hi',
  'devotional',
  7,
  'beginner',
  900,
  'भगवान राम की जीवन कथा सुंदर कविता और भक्ति छंदों के माध्यम से बताई गई है।',
  'तुलसीदास की महान कृति जो भगवान राम के दिव्य जीवन का वर्णन करती है, भक्ति, धर्म और आध्यात्मिक ज्ञान से परिपूर्ण।'
),
(
  'श्री हनुमान चालीसा',
  'तुलसीदास',
  'वैष्णववाद',
  'hi',
  'mantra',
  1,
  'beginner',
  15,
  'भगवान हनुमान को समर्पित 40 दोहे, जो भगवान राम के भक्त हैं।',
  'हनुमान जी की महिमा और कर्मों की स्तुति करने वाला शक्तिशाली भक्ति गीत, जो शक्ति और सुरक्षा प्रदान करता है।'
),
(
  'कबीर दोहावली',
  'संत कबीर',
  'भक्ति',
  'hi',
  'philosophical',
  1,
  'intermediate',
  300,
  'कबीर के दोहे जो जीवन, भक्ति और सत्य के गूढ़ रहस्यों को सरल भाषा में बताते हैं।',
  'संत कबीर की अमूल्य शिक्षाएं दोहों के रूप में, जो धर्म और जीवन की एकता का संदेश देती हैं।'
),

-- Sanskrit Scriptures
(
  'योगसूत्र',
  'पतञ्जलि',
  'योग',
  'sanskrit',
  'philosophical',
  4,
  'advanced',
  600,
  'योग के आठ अंगों का संपूर्ण दर्शन। मन को नियंत्रित करने और आत्मज्ञान प्राप्त करने का मार्ग।',
  'महर्षि पतञ्जलि द्वारा रचित योग का मूल ग्रंथ जो ध्यान, समाधि और मोक्ष का मार्ग बताता है।'
),
(
  'श्रीमद्भागवतम्',
  'वेदव्यास',
  'वैष्णववाद',
  'sanskrit',
  'scripture',
  12,
  'advanced',
  1800,
  'भगवान विष्णु और उनके अवतारों की महान कथाएं। विशेष रूप से श्री कृष्ण की लीलाओं का वर्णन।',
  'वैष्णव धर्म का सर्वोच्च पुराण जो भक्ति, ज्ञान और वैराग्य का सुंदर संयोजन प्रस्तुत करता है।'
),
(
  'उपनिषद्',
  'विभिन्न ऋषि',
  'वेदान्त',
  'sanskrit',
  'philosophical',
  108,
  'advanced',
  1200,
  'वेदों का दार्शनिक सार। ब्रह्म, आत्मा और जगत के स्वरूप का गूढ़ज्ञान।',
  'प्राचीन दार्शनिक ग्रंथ जो अस्तित्व, चेतना और परम सत्य की प्रकृति का अन्वेषण करते हैं।'
),

-- English Scriptures
(
  'The Bhagavad Gita',
  'Vyasa',
  'Vedanta',
  'english',
  'scripture',
  18,
  'intermediate',
  720,
  'The eternal dialogue between Prince Arjuna and Lord Krishna on the battlefield about duty, righteousness, and the path to liberation.',
  'A philosophical discourse addressing the moral and ethical struggles of life through the conversation between Arjuna and Krishna at Kurukshetra.'
),
(
  'The Upanishads',
  'Various Sages',
  'Vedanta',
  'english',
  'philosophical',
  108,
  'advanced',
  1200,
  'Ancient philosophical texts forming the foundation of Vedantic thought, exploring the nature of reality, consciousness, and ultimate truth.',
  'Sacred texts that examine the nature of existence, consciousness, and the ultimate reality beyond the material world.'
),
(
  'Yoga Sutras of Patanjali',
  'Patanjali',
  'Yoga',
  'english',
  'philosophical',
  4,
  'advanced',
  600,
  'The foundational text of classical yoga philosophy. A systematic guide to achieving mental clarity and spiritual enlightenment.',
  'The ancient treatise that outlines the eight limbs of yoga and the path to self-realization through meditation and practice.'
),
(
  'The Ramayana',
  'Valmiki',
  'Vaishnavism',
  'english',
  'scripture',
  7,
  'beginner',
  1200,
  'The epic tale of Lord Rama, his exile, the abduction of Sita, and the victory of good over evil.',
  'One of India''s greatest epics telling the story of dharma, devotion, and the triumph of righteousness over wickedness.'
);