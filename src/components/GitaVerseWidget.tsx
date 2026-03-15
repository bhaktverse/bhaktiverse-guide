import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

const GITA_VERSES = [
  { chapter: 2, verse: 47, sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन", english: "You have the right to perform your duty, but never to its fruits.", topic: "Karma Yoga" },
  { chapter: 2, verse: 14, sanskrit: "मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः", english: "O son of Kunti, the contact of senses with objects gives rise to cold, heat, pleasure, and pain. They are temporary; endure them.", topic: "Endurance" },
  { chapter: 4, verse: 7, sanskrit: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत", english: "Whenever there is a decline in righteousness and rise of unrighteousness, I manifest Myself.", topic: "Divine Protection" },
  { chapter: 6, verse: 5, sanskrit: "उद्धरेदात्मनात्मानं नात्मानमवसादयेत्", english: "Elevate yourself through the power of your mind, and not degrade yourself, for the mind can be the friend and also the enemy.", topic: "Self-Mastery" },
  { chapter: 9, verse: 22, sanskrit: "अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते", english: "Those who worship Me with exclusive devotion, meditating on My transcendental form — I carry what they lack and preserve what they have.", topic: "Devotion" },
  { chapter: 11, verse: 33, sanskrit: "तस्मात्त्वमुत्तिष्ठ यशो लभस्व", english: "Therefore arise and attain glory. Conquer your enemies and enjoy a prosperous kingdom.", topic: "Divine Will" },
  { chapter: 18, verse: 66, sanskrit: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज", english: "Abandon all varieties of dharma and simply surrender unto Me. I shall deliver you from all sinful reactions; do not fear.", topic: "Surrender" },
];

interface GitaVerseWidgetProps {
  variant?: 'compact' | 'full';
}

const GitaVerseWidget = ({ variant = 'full' }: GitaVerseWidgetProps) => {
  const [verse, setVerse] = useState(GITA_VERSES[0]);

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setVerse(GITA_VERSES[dayOfYear % GITA_VERSES.length]);
  }, []);

  if (variant === 'compact') {
    return (
      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-primary">Gita {verse.chapter}.{verse.verse}</span>
        </div>
        <p className="text-sm text-foreground italic">"{verse.english}"</p>
      </div>
    );
  }

  return (
    <Card className="card-sacred overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">Bhagavad Gita — Verse of the Day</h3>
            <span className="text-xs text-muted-foreground">Chapter {verse.chapter}, Verse {verse.verse} • {verse.topic}</span>
          </div>
        </div>
        <p className="text-base font-medium text-primary/90 mb-2 leading-relaxed" lang="hi">{verse.sanskrit}</p>
        <p className="text-sm text-muted-foreground italic leading-relaxed">"{verse.english}"</p>
      </CardContent>
    </Card>
  );
};

export default GitaVerseWidget;
