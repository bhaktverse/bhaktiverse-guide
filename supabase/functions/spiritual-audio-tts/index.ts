import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice = 'alloy', language = 'hi', textType = 'general' } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    console.log(`Generating TTS for ${textType} in ${language} with voice ${voice}`);

    // Enhance text based on spiritual context
    const enhancedText = enhanceTextForTTS(text, textType, language);

    // Generate speech from text using OpenAI
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd',  // Higher quality model
        input: enhancedText,
        voice: getOptimalVoice(voice, textType),
        response_format: 'mp3',
        speed: getOptimalSpeed(textType, language),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI TTS error:', error);
      throw new Error(error.error?.message || 'Failed to generate speech');
    }

    // Get audio buffer
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    console.log(`Generated audio of ${arrayBuffer.byteLength} bytes`);

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        audioType: 'mp3',
        duration: estimateAudioDuration(text),
        enhancedText
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in spiritual-audio-tts:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function enhanceTextForTTS(text: string, textType: string, language: string): string {
  // Add pronunciation guides and pauses for spiritual content
  let enhanced = text;

  if (textType === 'mantra' || textType === 'sanskrit') {
    // Add pauses between Sanskrit words for proper pronunciation
    enhanced = enhanced
      .replace(/([।॥])/g, '$1 ... ')  // Add pauses after Sanskrit punctuation
      .replace(/(ॐ|ऊँ)/g, 'ॐऽऽऽऽ')   // Extend Om sound
      .replace(/([।])/g, '$1 ... ');   // Pause after verse endings
  }

  if (textType === 'prayer' || textType === 'devotional') {
    // Add reverent pauses
    enhanced = enhanced
      .replace(/\n/g, ' ... ')
      .replace(/[।॥]/g, ' ... ');
  }

  if (textType === 'teaching' || textType === 'wisdom') {
    // Add contemplative pauses
    enhanced = enhanced
      .replace(/\./g, '. ... ')
      .replace(/:/g, ': ... ');
  }

  return enhanced;
}

function getOptimalVoice(requestedVoice: string, textType: string): string {
  const spiritualVoices = {
    'mantra': 'onyx',      // Deep, resonant for mantras
    'teaching': 'nova',     // Clear, wise for teachings  
    'devotional': 'shimmer', // Gentle, emotional for devotional
    'prayer': 'alloy',      // Universal, reverent
    'default': 'alloy'
  };

  return spiritualVoices[textType as keyof typeof spiritualVoices] || requestedVoice;
}

function getOptimalSpeed(textType: string, language: string): number {
  const speeds = {
    'mantra': 0.8,       // Slower for meditation
    'sanskrit': 0.7,     // Very slow for pronunciation
    'prayer': 0.9,       // Reverent pace
    'teaching': 1.0,     // Normal pace
    'devotional': 0.9,   // Gentle pace
    'default': 1.0
  };

  // Adjust for language - Sanskrit/Hindi typically slower
  const langMultiplier = language === 'hi' || language === 'sa' ? 0.9 : 1.0;
  
  return (speeds[textType as keyof typeof speeds] || 1.0) * langMultiplier;
}

function estimateAudioDuration(text: string): number {
  // Rough estimation: ~150 words per minute for spiritual content
  const words = text.split(/\s+/).length;
  return Math.ceil((words / 120) * 60); // 120 WPM for spiritual content in seconds
}