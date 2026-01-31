// Complete Tarot Card Database with Hindu Spiritual Correlations

export interface TarotCardData {
  id: number;
  name: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  element: string;
  planet?: string;
  zodiac?: string;
  keywords: {
    upright: string[];
    reversed: string[];
  };
  meaning: {
    upright: string;
    reversed: string;
  };
  advice: {
    upright: string;
    reversed: string;
  };
  hinduCorrelation: {
    deity?: string;
    concept: string;
    mantra?: string;
  };
  imageSymbol: string;
  numerology: number;
}

export const MAJOR_ARCANA: TarotCardData[] = [
  {
    id: 0,
    name: "The Fool",
    arcana: 'major',
    element: "Air",
    planet: "Uranus",
    zodiac: "Aquarius",
    keywords: {
      upright: ["New beginnings", "Innocence", "Spontaneity", "Free spirit"],
      reversed: ["Recklessness", "Fear", "Risk-taking", "Naivety"]
    },
    meaning: {
      upright: "A fresh start awaits you. Embrace new adventures with childlike wonder and trust in the universe's plan.",
      reversed: "Hesitation and fear of the unknown may be holding you back. Consider if excessive caution serves you."
    },
    advice: {
      upright: "Take the leap of faith. The universe supports your new journey.",
      reversed: "Reflect before acting. Wisdom comes from experience."
    },
    hinduCorrelation: {
      deity: "Ganesha",
      concept: "Aarambh (Beginning) - Starting a new spiritual journey like a Sannyasi",
      mantra: "Om Gam Ganapataye Namaha"
    },
    imageSymbol: "🎭",
    numerology: 0
  },
  {
    id: 1,
    name: "The Magician",
    arcana: 'major',
    element: "Air",
    planet: "Mercury",
    zodiac: "Gemini/Virgo",
    keywords: {
      upright: ["Manifestation", "Willpower", "Creation", "Skill"],
      reversed: ["Manipulation", "Untapped talents", "Deception", "Trickery"]
    },
    meaning: {
      upright: "You possess all the tools needed for success. Channel your skills and willpower to manifest your desires.",
      reversed: "Your talents may be misdirected or underutilized. Beware of manipulation, yours or others'."
    },
    advice: {
      upright: "Focus your energy. You have everything you need.",
      reversed: "Realign your intentions with dharma (righteous path)."
    },
    hinduCorrelation: {
      deity: "Budh Dev (Mercury)",
      concept: "Siddhi - The power to manifest through focused intention",
      mantra: "Om Budhaya Namaha"
    },
    imageSymbol: "🧙‍♂️",
    numerology: 1
  },
  {
    id: 2,
    name: "The High Priestess",
    arcana: 'major',
    element: "Water",
    planet: "Moon",
    zodiac: "Cancer",
    keywords: {
      upright: ["Intuition", "Mystery", "Inner knowledge", "Divine feminine"],
      reversed: ["Secrets", "Disconnection", "Withdrawal", "Silence"]
    },
    meaning: {
      upright: "Trust your intuition. Hidden knowledge is accessible through meditation and inner reflection.",
      reversed: "You may be ignoring your inner voice or keeping secrets that need addressing."
    },
    advice: {
      upright: "Listen to your inner wisdom. Meditate for clarity.",
      reversed: "Reconnect with your spiritual practice. Seek inner truth."
    },
    hinduCorrelation: {
      deity: "Saraswati",
      concept: "Gyan Shakti - The power of intuitive wisdom and hidden knowledge",
      mantra: "Om Aim Saraswatyai Namaha"
    },
    imageSymbol: "🌙",
    numerology: 2
  },
  {
    id: 3,
    name: "The Empress",
    arcana: 'major',
    element: "Earth",
    planet: "Venus",
    zodiac: "Taurus/Libra",
    keywords: {
      upright: ["Abundance", "Nurturing", "Fertility", "Nature"],
      reversed: ["Dependence", "Smothering", "Emptiness", "Creative block"]
    },
    meaning: {
      upright: "Abundance flows to you naturally. Embrace creativity, nurturing, and the beauty of life.",
      reversed: "You may be neglecting self-care or feeling creatively blocked."
    },
    advice: {
      upright: "Connect with nature. Nurture yourself and others.",
      reversed: "Release control. Allow natural growth to occur."
    },
    hinduCorrelation: {
      deity: "Lakshmi / Parvati",
      concept: "Prakriti - The nurturing mother energy of the universe",
      mantra: "Om Shri Mahalakshmyai Namaha"
    },
    imageSymbol: "👸",
    numerology: 3
  },
  {
    id: 4,
    name: "The Emperor",
    arcana: 'major',
    element: "Fire",
    planet: "Mars",
    zodiac: "Aries",
    keywords: {
      upright: ["Authority", "Structure", "Leadership", "Father figure"],
      reversed: ["Tyranny", "Rigidity", "Domination", "Lack of discipline"]
    },
    meaning: {
      upright: "Establish order and structure. Your leadership abilities are at their peak.",
      reversed: "Excessive control or lack of discipline may be causing issues."
    },
    advice: {
      upright: "Take charge with wisdom. Lead by example.",
      reversed: "Balance authority with compassion."
    },
    hinduCorrelation: {
      deity: "Indra / Mangal Dev",
      concept: "Raja Dharma - The duty of righteous leadership and protection",
      mantra: "Om Mangalaya Namaha"
    },
    imageSymbol: "👑",
    numerology: 4
  },
  {
    id: 5,
    name: "The Hierophant",
    arcana: 'major',
    element: "Earth",
    planet: "Venus",
    zodiac: "Taurus",
    keywords: {
      upright: ["Tradition", "Spiritual wisdom", "Guidance", "Conformity"],
      reversed: ["Rebellion", "Subversiveness", "New approaches", "Freedom"]
    },
    meaning: {
      upright: "Seek guidance from traditional wisdom and spiritual teachers.",
      reversed: "Question established norms. Your own path may diverge from tradition."
    },
    advice: {
      upright: "Honor your traditions. Seek a guru's guidance.",
      reversed: "Find your own spiritual path while respecting wisdom."
    },
    hinduCorrelation: {
      deity: "Brihaspati (Jupiter)",
      concept: "Guru Tattva - The sacred teacher-student relationship",
      mantra: "Om Gurave Namaha"
    },
    imageSymbol: "🙏",
    numerology: 5
  },
  {
    id: 6,
    name: "The Lovers",
    arcana: 'major',
    element: "Air",
    planet: "Mercury",
    zodiac: "Gemini",
    keywords: {
      upright: ["Love", "Harmony", "Partnership", "Choice"],
      reversed: ["Disharmony", "Imbalance", "Misalignment", "Conflict"]
    },
    meaning: {
      upright: "A significant relationship or choice is before you. Follow your heart with wisdom.",
      reversed: "Relationship imbalances or difficult choices may be causing conflict."
    },
    advice: {
      upright: "Choose love. Align heart and mind.",
      reversed: "Address underlying conflicts with honesty."
    },
    hinduCorrelation: {
      deity: "Radha-Krishna",
      concept: "Prem Bhakti - Divine love and the union of complementary energies",
      mantra: "Om Shri Krishnaya Namaha"
    },
    imageSymbol: "❤️",
    numerology: 6
  },
  {
    id: 7,
    name: "The Chariot",
    arcana: 'major',
    element: "Water",
    planet: "Moon",
    zodiac: "Cancer",
    keywords: {
      upright: ["Victory", "Willpower", "Determination", "Control"],
      reversed: ["Lack of direction", "Aggression", "Obstacles", "Defeat"]
    },
    meaning: {
      upright: "Victory through willpower and determination. You are in control of your destiny.",
      reversed: "Scattered energy or lack of direction may be blocking progress."
    },
    advice: {
      upright: "Stay focused. Victory is within reach.",
      reversed: "Pause and reconsider your direction."
    },
    hinduCorrelation: {
      deity: "Arjuna / Krishna (as charioteer)",
      concept: "Vijaya - Victory through righteous action as taught in Bhagavad Gita",
      mantra: "Om Vijaya Namaha"
    },
    imageSymbol: "🏆",
    numerology: 7
  },
  {
    id: 8,
    name: "Strength",
    arcana: 'major',
    element: "Fire",
    planet: "Sun",
    zodiac: "Leo",
    keywords: {
      upright: ["Courage", "Inner strength", "Patience", "Compassion"],
      reversed: ["Self-doubt", "Weakness", "Insecurity", "Raw emotion"]
    },
    meaning: {
      upright: "Your inner strength and compassion will guide you through challenges.",
      reversed: "Self-doubt or suppressed emotions may be undermining your power."
    },
    advice: {
      upright: "Lead with heart. Gentle strength conquers all.",
      reversed: "Acknowledge your emotions. Seek inner peace."
    },
    hinduCorrelation: {
      deity: "Hanuman / Durga",
      concept: "Shakti - Divine inner strength and courage",
      mantra: "Om Hanumate Namaha"
    },
    imageSymbol: "🦁",
    numerology: 8
  },
  {
    id: 9,
    name: "The Hermit",
    arcana: 'major',
    element: "Earth",
    planet: "Mercury",
    zodiac: "Virgo",
    keywords: {
      upright: ["Introspection", "Solitude", "Inner guidance", "Wisdom"],
      reversed: ["Isolation", "Loneliness", "Withdrawal", "Rejection"]
    },
    meaning: {
      upright: "Seek solitude for inner wisdom. The answers you seek are within.",
      reversed: "Excessive isolation may be harmful. Consider reconnecting with others."
    },
    advice: {
      upright: "Retreat for wisdom. Your light guides others.",
      reversed: "Balance solitude with connection."
    },
    hinduCorrelation: {
      deity: "Shiva as Dakshinamurthy",
      concept: "Tapas - Spiritual austerity and the wisdom gained through solitary meditation",
      mantra: "Om Namah Shivaya"
    },
    imageSymbol: "🏔️",
    numerology: 9
  },
  {
    id: 10,
    name: "Wheel of Fortune",
    arcana: 'major',
    element: "Fire",
    planet: "Jupiter",
    zodiac: "Sagittarius",
    keywords: {
      upright: ["Change", "Cycles", "Fate", "Turning point"],
      reversed: ["Bad luck", "Resistance", "Breaking cycles", "Stagnation"]
    },
    meaning: {
      upright: "A significant change is coming. The wheel turns in your favor.",
      reversed: "External changes may feel challenging. Focus on what you can control."
    },
    advice: {
      upright: "Embrace change. Fortune favors the adaptable.",
      reversed: "Accept what cannot be changed. This too shall pass."
    },
    hinduCorrelation: {
      deity: "Vishnu as Time (Kala)",
      concept: "Kalachakra - The wheel of time and karma",
      mantra: "Om Namo Bhagavate Vasudevaya"
    },
    imageSymbol: "🎡",
    numerology: 10
  },
  {
    id: 11,
    name: "Justice",
    arcana: 'major',
    element: "Air",
    planet: "Venus",
    zodiac: "Libra",
    keywords: {
      upright: ["Fairness", "Truth", "Cause and effect", "Law"],
      reversed: ["Unfairness", "Dishonesty", "Imbalance", "Lack of accountability"]
    },
    meaning: {
      upright: "Truth and fairness will prevail. Karmic balance is being restored.",
      reversed: "Injustice or dishonesty may be affecting the situation."
    },
    advice: {
      upright: "Act with integrity. Justice will be served.",
      reversed: "Examine your own role in creating imbalance."
    },
    hinduCorrelation: {
      deity: "Yama (God of Dharma)",
      concept: "Karma Phala - The law of cause and effect, reaping what you sow",
      mantra: "Om Dharmarajaya Namaha"
    },
    imageSymbol: "⚖️",
    numerology: 11
  },
  {
    id: 12,
    name: "The Hanged Man",
    arcana: 'major',
    element: "Water",
    planet: "Neptune",
    zodiac: "Pisces",
    keywords: {
      upright: ["Surrender", "New perspective", "Pause", "Sacrifice"],
      reversed: ["Resistance", "Stalling", "Martyrdom", "Selfishness"]
    },
    meaning: {
      upright: "Pause and see things from a new perspective. Surrender leads to enlightenment.",
      reversed: "Resistance to necessary change or playing the victim."
    },
    advice: {
      upright: "Let go. Wisdom comes through surrender.",
      reversed: "Stop resisting what is. Flow with life."
    },
    hinduCorrelation: {
      deity: "Shiva in meditation",
      concept: "Vairagya - Detachment and seeing life from a higher perspective",
      mantra: "Om Tryambakam Yajamahe"
    },
    imageSymbol: "🙃",
    numerology: 12
  },
  {
    id: 13,
    name: "Death",
    arcana: 'major',
    element: "Water",
    planet: "Pluto",
    zodiac: "Scorpio",
    keywords: {
      upright: ["Transformation", "Endings", "Rebirth", "Transition"],
      reversed: ["Resistance to change", "Stagnation", "Fear", "Decay"]
    },
    meaning: {
      upright: "An ending creates space for new beginnings. Transformation is necessary.",
      reversed: "Fear of change may be preventing necessary growth."
    },
    advice: {
      upright: "Release the old. Rebirth awaits.",
      reversed: "Face your fears. Change is natural and necessary."
    },
    hinduCorrelation: {
      deity: "Shiva as Mahakala / Kali",
      concept: "Moksha - Liberation through the death of ego and attachments",
      mantra: "Om Kali Mahakali Namaha"
    },
    imageSymbol: "🦋",
    numerology: 13
  },
  {
    id: 14,
    name: "Temperance",
    arcana: 'major',
    element: "Fire",
    planet: "Jupiter",
    zodiac: "Sagittarius",
    keywords: {
      upright: ["Balance", "Moderation", "Patience", "Harmony"],
      reversed: ["Imbalance", "Excess", "Lack of harmony", "Impatience"]
    },
    meaning: {
      upright: "Find balance and moderation. Patience and harmony lead to success.",
      reversed: "Extremes or impatience may be causing problems."
    },
    advice: {
      upright: "Practice moderation. Balance all aspects of life.",
      reversed: "Restore equilibrium. Avoid extremes."
    },
    hinduCorrelation: {
      deity: "Vishnu",
      concept: "Samata - Equanimity and balance in all things",
      mantra: "Om Namo Narayanaya"
    },
    imageSymbol: "⚗️",
    numerology: 14
  },
  {
    id: 15,
    name: "The Devil",
    arcana: 'major',
    element: "Earth",
    planet: "Saturn",
    zodiac: "Capricorn",
    keywords: {
      upright: ["Bondage", "Materialism", "Addiction", "Shadow self"],
      reversed: ["Liberation", "Breaking free", "Reclaiming power", "Detachment"]
    },
    meaning: {
      upright: "Examine what binds you - attachments, addictions, or material desires.",
      reversed: "You are breaking free from limitations and reclaiming your power."
    },
    advice: {
      upright: "Recognize your chains. You hold the key.",
      reversed: "Continue the path of liberation. Stay vigilant."
    },
    hinduCorrelation: {
      deity: "Rahu",
      concept: "Maya Bandhan - The illusions that bind us to material existence",
      mantra: "Om Rahave Namaha"
    },
    imageSymbol: "⛓️",
    numerology: 15
  },
  {
    id: 16,
    name: "The Tower",
    arcana: 'major',
    element: "Fire",
    planet: "Mars",
    zodiac: "Aries",
    keywords: {
      upright: ["Sudden change", "Upheaval", "Revelation", "Awakening"],
      reversed: ["Fear of change", "Avoidance", "Delayed disaster", "Resisting inevitable change"]
    },
    meaning: {
      upright: "Sudden disruption clears the way for truth. What's built on false foundations must fall.",
      reversed: "You may be avoiding a necessary upheaval or clinging to what needs to change."
    },
    advice: {
      upright: "Let false structures fall. Truth liberates.",
      reversed: "Don't resist inevitable change. Embrace renewal."
    },
    hinduCorrelation: {
      deity: "Rudra (Shiva's destructive aspect)",
      concept: "Pralay - Necessary destruction for cosmic renewal",
      mantra: "Om Rudraya Namaha"
    },
    imageSymbol: "⚡",
    numerology: 16
  },
  {
    id: 17,
    name: "The Star",
    arcana: 'major',
    element: "Air",
    planet: "Uranus",
    zodiac: "Aquarius",
    keywords: {
      upright: ["Hope", "Inspiration", "Renewal", "Serenity"],
      reversed: ["Despair", "Disconnection", "Lack of faith", "Discouragement"]
    },
    meaning: {
      upright: "Hope and healing are coming. Stay connected to your higher purpose.",
      reversed: "You may have lost faith or feel disconnected from your spiritual path."
    },
    advice: {
      upright: "Keep hope alive. You are divinely guided.",
      reversed: "Reconnect with your source. Hope returns."
    },
    hinduCorrelation: {
      deity: "Lakshmi / Nakshatras",
      concept: "Asha - Hope and the guiding light of divine grace",
      mantra: "Om Shri Mahalakshmyai Namaha"
    },
    imageSymbol: "⭐",
    numerology: 17
  },
  {
    id: 18,
    name: "The Moon",
    arcana: 'major',
    element: "Water",
    planet: "Moon",
    zodiac: "Pisces",
    keywords: {
      upright: ["Illusion", "Intuition", "Dreams", "Subconscious"],
      reversed: ["Confusion", "Fear", "Misinterpretation", "Deception revealed"]
    },
    meaning: {
      upright: "Trust your intuition but beware of illusions. Not all is as it seems.",
      reversed: "Clarity is emerging from confusion. Hidden truths are being revealed."
    },
    advice: {
      upright: "Navigate carefully. Trust your inner light.",
      reversed: "Deceptions are clearing. Truth emerges."
    },
    hinduCorrelation: {
      deity: "Chandra Dev",
      concept: "Maya - The cosmic illusion and the importance of seeing beyond appearances",
      mantra: "Om Chandraya Namaha"
    },
    imageSymbol: "🌙",
    numerology: 18
  },
  {
    id: 19,
    name: "The Sun",
    arcana: 'major',
    element: "Fire",
    planet: "Sun",
    zodiac: "Leo",
    keywords: {
      upright: ["Joy", "Success", "Vitality", "Positivity"],
      reversed: ["Temporary depression", "Lack of success", "Sadness", "Blocked happiness"]
    },
    meaning: {
      upright: "Radiant success and joy are yours. Bask in the light of achievement.",
      reversed: "Temporary clouds may dim your joy, but the sun will shine again."
    },
    advice: {
      upright: "Celebrate success. Share your light.",
      reversed: "Patience. Happiness returns soon."
    },
    hinduCorrelation: {
      deity: "Surya Dev",
      concept: "Tej - Radiance, vitality, and the illuminating power of consciousness",
      mantra: "Om Suryaya Namaha"
    },
    imageSymbol: "☀️",
    numerology: 19
  },
  {
    id: 20,
    name: "Judgement",
    arcana: 'major',
    element: "Fire",
    planet: "Pluto",
    zodiac: "Scorpio",
    keywords: {
      upright: ["Rebirth", "Reckoning", "Awakening", "Absolution"],
      reversed: ["Self-doubt", "Ignoring the call", "Fear of death", "Refusal to change"]
    },
    meaning: {
      upright: "A spiritual awakening and call to higher purpose. Answer your soul's calling.",
      reversed: "You may be ignoring an important call or fearing transformation."
    },
    advice: {
      upright: "Answer the call. Rise to your purpose.",
      reversed: "Don't ignore inner guidance. Transformation awaits."
    },
    hinduCorrelation: {
      deity: "Chitragupta",
      concept: "Chitragupta Lekha - The cosmic record of deeds and spiritual accounting",
      mantra: "Om Chitraguptaya Namaha"
    },
    imageSymbol: "📯",
    numerology: 20
  },
  {
    id: 21,
    name: "The World",
    arcana: 'major',
    element: "Earth",
    planet: "Saturn",
    zodiac: "Capricorn",
    keywords: {
      upright: ["Completion", "Integration", "Accomplishment", "Travel"],
      reversed: ["Incompletion", "Shortcuts", "Delays", "Unfulfillment"]
    },
    meaning: {
      upright: "A major cycle is complete. Celebrate your achievements and prepare for the next journey.",
      reversed: "Something remains incomplete. Loose ends need attention."
    },
    advice: {
      upright: "Celebrate completion. A new cycle begins.",
      reversed: "Complete unfinished business before moving on."
    },
    hinduCorrelation: {
      deity: "Vishnu as Jagannath",
      concept: "Poorna - Wholeness and the completion of a karma cycle",
      mantra: "Om Purnamadah Purnamidam"
    },
    imageSymbol: "🌍",
    numerology: 21
  }
];

export const SUITS: Record<string, { element: string; association: string; keywords: string[]; deity: string }> = {
  wands: {
    element: "Fire",
    association: "Action, creativity, passion, willpower",
    keywords: ["Energy", "Inspiration", "Determination", "Spirituality"],
    deity: "Agni Dev"
  },
  cups: {
    element: "Water",
    association: "Emotions, relationships, intuition, feelings",
    keywords: ["Love", "Feelings", "Relationships", "Creativity"],
    deity: "Varuna Dev"
  },
  swords: {
    element: "Air",
    association: "Thoughts, communication, truth, conflict",
    keywords: ["Intellect", "Truth", "Conflict", "Decision"],
    deity: "Vayu Dev"
  },
  pentacles: {
    element: "Earth",
    association: "Material matters, work, money, physical world",
    keywords: ["Wealth", "Career", "Health", "Manifestation"],
    deity: "Prithvi Devi / Kubera"
  }
};

export const POSITIONS: { name: string; meaning: string; icon: string }[] = [
  { name: "Past", meaning: "Influences from your past that shape current situation", icon: "⏮️" },
  { name: "Present", meaning: "Your current energy, situation, and challenges", icon: "⏯️" },
  { name: "Future", meaning: "The likely outcome based on current trajectory", icon: "⏭️" }
];

export const SPREAD_TYPES = {
  threeCard: {
    name: "Past-Present-Future",
    cardCount: 3,
    positions: ["Past", "Present", "Future"],
    description: "A quick overview of your journey"
  },
  celticCross: {
    name: "Celtic Cross",
    cardCount: 10,
    positions: [
      "Present", "Challenge", "Foundation", "Recent Past",
      "Possible Future", "Immediate Future", "Self",
      "Environment", "Hopes/Fears", "Final Outcome"
    ],
    description: "Comprehensive life reading (Premium)"
  },
  relationship: {
    name: "Love Reading",
    cardCount: 5,
    positions: ["Your Energy", "Partner's Energy", "Foundation", "Challenge", "Outcome"],
    description: "Insight into your romantic life"
  },
  career: {
    name: "Career Path",
    cardCount: 5,
    positions: ["Current Position", "Obstacles", "Hidden Influences", "Advice", "Potential"],
    description: "Guidance for your professional journey"
  },
  singleCard: {
    name: "Daily Card",
    cardCount: 1,
    positions: ["Message of the Day"],
    description: "Quick daily guidance"
  }
};

// Helper function to get random cards
export const drawCards = (count: number, allowReversed: boolean = true): Array<TarotCardData & { isReversed: boolean; position?: string }> => {
  const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(card => ({
    ...card,
    isReversed: allowReversed && Math.random() > 0.7
  }));
};
