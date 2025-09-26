import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      contentType, 
      contentId, 
      targetLanguage = 'hi', 
      includeOriginal = true,
      contentCategories = []
    } = await req.json();

    console.log(`Fetching ${contentType} content in ${targetLanguage}`);

    let content = [];

    switch (contentType) {
      case 'saints':
        content = await getMultilingualSaints(targetLanguage, includeOriginal);
        break;
      case 'scriptures':
        content = await getMultilingualScriptures(targetLanguage, includeOriginal);
        break;
      case 'spiritual_content':
        content = await getMultilingualSpiritualContent(targetLanguage, contentCategories);
        break;
      case 'temples':
        content = await getMultilingualTemples(targetLanguage, includeOriginal);
        break;
      case 'translate':
        content = await translateContent(contentId, contentType, targetLanguage);
        break;
      default:
        throw new Error('Invalid content type');
    }

    return new Response(
      JSON.stringify({ 
        content,
        language: targetLanguage,
        contentType,
        total: content.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in multilingual-content:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function getMultilingualSaints(targetLanguage: string, includeOriginal: boolean) {
  const { data: saints, error } = await supabase
    .from('saints')
    .select('*')
    .order('name');

  if (error) throw error;

  return Promise.all(saints.map(async (saint) => {
    const multilingualSaint = { ...saint };

    // Get regional names if available
    if (saint.regional_names && saint.regional_names[targetLanguage]) {
      multilingualSaint.display_name = saint.regional_names[targetLanguage];
    }

    // Translate biography and teachings if needed
    if (targetLanguage !== 'en' && saint.biography) {
      multilingualSaint.translated_biography = await translateText(
        saint.biography, 
        targetLanguage, 
        'biography'
      );
    }

    if (targetLanguage !== 'en' && saint.key_teachings) {
      multilingualSaint.translated_teachings = await translateText(
        saint.key_teachings, 
        targetLanguage, 
        'teachings'
      );
    }

    // Include original quotes and add translations
    if (saint.famous_quotes && Array.isArray(saint.famous_quotes)) {
      multilingualSaint.multilingual_quotes = await Promise.all(
        saint.famous_quotes.map(async (quote: string) => ({
          original: quote,
          translated: targetLanguage !== 'en' ? await translateText(quote, targetLanguage, 'quote') : quote,
          language: targetLanguage
        }))
      );
    }

    return multilingualSaint;
  }));
}

async function getMultilingualScriptures(targetLanguage: string, includeOriginal: boolean) {
  const { data: scriptures, error } = await supabase
    .from('scriptures')
    .select('*')
    .order('title');

  if (error) throw error;

  return Promise.all(scriptures.map(async (scripture) => {
    const multilingualScripture = { ...scripture };

    // Translate title and description
    if (targetLanguage !== scripture.language) {
      multilingualScripture.translated_title = await translateText(
        scripture.title, 
        targetLanguage, 
        'title'
      );
      
      if (scripture.description) {
        multilingualScripture.translated_description = await translateText(
          scripture.description, 
          targetLanguage, 
          'description'
        );
      }

      if (scripture.summary) {
        multilingualScripture.translated_summary = await translateText(
          scripture.summary, 
          targetLanguage, 
          'summary'
        );
      }
    }

    return multilingualScripture;
  }));
}

async function getMultilingualSpiritualContent(targetLanguage: string, categories: string[]) {
  let query = supabase
    .from('spiritual_content')
    .select('*');

  if (categories.length > 0) {
    query = query.in('category', categories);
  }

  const { data: content, error } = await query
    .eq('language', targetLanguage)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;

  return content.map(item => ({
    ...item,
    multilingual: true,
    source_language: item.language
  }));
}

async function getMultilingualTemples(targetLanguage: string, includeOriginal: boolean) {
  const { data: temples, error } = await supabase
    .from('temples')
    .select('*')
    .order('name');

  if (error) throw error;

  return Promise.all(temples.map(async (temple) => {
    const multilingualTemple = { ...temple };

    // Translate temple name and description
    if (targetLanguage !== 'en') {
      multilingualTemple.translated_name = await translateText(
        temple.name, 
        targetLanguage, 
        'temple_name'
      );
      
      if (temple.description) {
        multilingualTemple.translated_description = await translateText(
          temple.description, 
          targetLanguage, 
          'description'
        );
      }

      if (temple.history) {
        multilingualTemple.translated_history = await translateText(
          temple.history, 
          targetLanguage, 
          'history'
        );
      }
    }

    return multilingualTemple;
  }));
}

async function translateContent(contentId: string, contentType: string, targetLanguage: string) {
  const { data: content, error } = await supabase
    .from(contentType)
    .select('*')
    .eq('id', contentId)
    .single();

  if (error) throw error;

  // Translate specific fields based on content type
  const translatedContent = { ...content };
  
  const fieldsToTranslate = getTranslatableFields(contentType);
  
  for (const field of fieldsToTranslate) {
    if (content[field]) {
      translatedContent[`translated_${field}`] = await translateText(
        content[field],
        targetLanguage,
        field
      );
    }
  }

  return translatedContent;
}

function getTranslatableFields(contentType: string): string[] {
  const fieldMappings = {
    'saints': ['name', 'biography', 'key_teachings'],
    'scriptures': ['title', 'description', 'summary'],
    'temples': ['name', 'description', 'history'],
    'spiritual_content': ['title', 'content', 'summary']
  };

  return fieldMappings[contentType as keyof typeof fieldMappings] || [];
}

async function translateText(text: string, targetLanguage: string, context: string): Promise<string> {
  if (!text) return '';

  const languageNames: { [key: string]: string } = {
    'hi': 'Hindi',
    'en': 'English',
    'sa': 'Sanskrit',
    'ta': 'Tamil',
    'te': 'Telugu',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'gu': 'Gujarati',
    'bn': 'Bengali',
    'pa': 'Punjabi',
    'mr': 'Marathi',
    'or': 'Odia'
  };

  const contextPrompts = {
    'biography': 'This is a spiritual biography of a saint or religious figure.',
    'teachings': 'These are spiritual teachings and philosophical concepts.',
    'quote': 'This is a spiritual quote or saying.',
    'title': 'This is a title of a spiritual text or content.',
    'description': 'This is a description of spiritual content.',
    'temple_name': 'This is the name of a Hindu temple.',
    'history': 'This is historical information about a spiritual place or figure.',
    'mantra': 'This is a sacred mantra or chant.',
    'prayer': 'This is a spiritual prayer.'
  };

  const prompt = `Translate the following spiritual text into ${languageNames[targetLanguage] || targetLanguage}. 
Context: ${contextPrompts[context as keyof typeof contextPrompts] || 'Spiritual content'}

Important guidelines:
- Maintain the spiritual and devotional tone
- Keep Sanskrit terms in original script when appropriate
- Preserve the sacred meaning and intent
- Use respectful and traditional language
- For mantras and prayers, provide both transliteration and meaning

Text to translate: "${text}"

Provide only the translation:`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert translator specializing in spiritual and religious texts across Indian languages.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('Translation failed:', await response.text());
      return text; // Return original if translation fails
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();

  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original if translation fails
  }
}