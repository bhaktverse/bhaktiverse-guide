import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const results: Record<string, string> = {};

  // Insert temples
  const { error: tErr } = await supabase.from("temples").upsert([
    { name: "Sankat Mochan Hanuman Temple", primary_deity: "Lord Hanuman", location: { city: "Varanasi", state: "Uttar Pradesh", country: "India" }, description: "One of the most sacred Hanuman temples in India, established by Tulsidas. Known for its spiritual ambiance and daily Sunderkand path.", tradition: "Ramayana tradition", rating: 4.7, verified: true },
    { name: "Hanuman Garhi", primary_deity: "Lord Hanuman", location: { city: "Ayodhya", state: "Uttar Pradesh", country: "India" }, description: "A 10th century temple on a hill in Ayodhya. Devotees climb 76 steps to reach the main shrine of Bal Hanuman.", tradition: "Ramayana tradition", rating: 4.6, verified: true },
    { name: "Mehandipur Balaji Temple", primary_deity: "Lord Hanuman (Balaji)", location: { city: "Mehandipur", state: "Rajasthan", country: "India" }, description: "Famous Hanuman temple known for healing rituals. One of the most visited Balaji temples in India.", tradition: "Shakti worship", rating: 4.5, verified: true },
    { name: "Jakhu Temple", primary_deity: "Lord Hanuman", location: { city: "Shimla", state: "Himachal Pradesh", country: "India" }, description: "Ancient temple with a 108-foot Hanuman statue at the highest point of Shimla.", tradition: "Ramayana tradition", rating: 4.4, verified: true },
    { name: "ISKCON Vrindavan", primary_deity: "Lord Krishna", location: { city: "Vrindavan", state: "Uttar Pradesh", country: "India" }, description: "Sri Sri Krishna Balaram Mandir with exquisite marble architecture and daily kirtan.", tradition: "Gaudiya Vaishnavism", rating: 4.8, verified: true },
    { name: "Dwarkadhish Temple", primary_deity: "Lord Krishna (Dwarkadhish)", location: { city: "Dwarka", state: "Gujarat", country: "India" }, description: "One of the Char Dham sites. Five-storied temple believed to be 2500 years old.", tradition: "Vaishnavism", rating: 4.7, verified: true },
    { name: "Ranganathaswamy Temple", primary_deity: "Lord Vishnu (Ranganatha)", location: { city: "Srirangam", state: "Tamil Nadu", country: "India" }, description: "Largest functioning Hindu temple in the world, a Dravidian masterpiece.", tradition: "Sri Vaishnavism", rating: 4.9, verified: true },
    { name: "Padmanabhaswamy Temple", primary_deity: "Lord Vishnu (Padmanabha)", location: { city: "Thiruvananthapuram", state: "Kerala", country: "India" }, description: "One of 108 Divya Desams. The richest temple in the world.", tradition: "Sri Vaishnavism", rating: 4.8, verified: true },
  ]);
  results.temples = tErr ? tErr.message : "ok";

  // Insert saints
  const { error: sErr } = await supabase.from("saints").insert([
    { name: "Ramanujacharya", tradition: "Sri Vaishnavism", biography: "The great Vaishnava philosopher who established Vishishtadvaita Vedanta. Born in 1017 CE in Sriperumbudur, he reformed temple worship and made spirituality accessible to all.", key_teachings: "Vishishtadvaita (qualified non-dualism), devotion to Vishnu as supreme, equality in devotion", birth_year: 1017, death_year: 1137, primary_language: "ta", verified: true },
    { name: "Madhvacharya", tradition: "Madhva (Dvaita)", biography: "Founder of Dvaita school of Vedanta. Born near Udupi, Karnataka. Established the Ashta Mathas of Udupi.", key_teachings: "Dvaita philosophy - eternal distinction between soul and God, Vishnu as supreme reality", birth_year: 1238, death_year: 1317, primary_language: "kn", verified: true },
    { name: "Vallabhacharya", tradition: "Vallabha (Pushti Marg)", biography: "Founder of Pushti Marg, the path of grace. Established the worship of Shrinathji at Nathdwara.", key_teachings: "Shuddhadvaita, Pushti Marg - path of divine grace, Krishna as supreme Brahman", birth_year: 1479, death_year: 1531, primary_language: "hi", verified: true },
    { name: "Nimbarkacharya", tradition: "Nimbarka (Dvaitadvaita)", biography: "Founder of the Nimbarka Sampradaya. Propounded Dvaitadvaita philosophy. Devoted to Radha-Krishna worship.", key_teachings: "Dvaitadvaita philosophy, Radha-Krishna as supreme divine couple", birth_year: 1130, death_year: 1200, primary_language: "hi", verified: true },
    { name: "Tulsidas", tradition: "Ramayana tradition", biography: "Author of Ramcharitmanas, the Hindi retelling of the Ramayana. His work transformed Rama devotion across North India.", key_teachings: "Devotion to Lord Rama, spiritual wisdom through poetry, equality of all devotees", birth_year: 1532, death_year: 1623, primary_language: "hi", verified: true },
    { name: "Surdas", tradition: "Vallabha (Pushti Marg)", biography: "Blind poet-saint of Pushti Marg. His Sur Sagar contains thousands of devotional poems celebrating Krishna Leela.", key_teachings: "Krishna bhakti through poetry, surrender to divine will", birth_year: 1478, death_year: 1583, primary_language: "hi", verified: true },
    { name: "Mirabai", tradition: "Vaishnavism", biography: "Rajput princess who became one of the most celebrated Krishna bhaktas. Her devotional songs express intense love for Krishna.", key_teachings: "Unconditional devotion to Krishna, love transcends social boundaries", birth_year: 1498, death_year: 1546, primary_language: "hi", verified: true },
  ], { onConflict: "name", ignoreDuplicates: true });
  results.saints = sErr ? sErr.message : "ok";

  // Insert more audio tracks
  const { error: aErr } = await supabase.from("audio_library").upsert([
    { title: "Vishnu Sahasranama", artist: "Traditional", category: "mantra", duration: 1800, language: "sa", audio_url: "https://archive.org/download/vishnu-sahasranama/vishnu-sahasranama.ogg", associated_deity: "Vishnu", difficulty_level: "intermediate" },
    { title: "Hanuman Aarti", artist: "Traditional", category: "aarti", duration: 300, language: "hi", audio_url: "https://archive.org/download/hanuman-aarti/hanuman-aarti.ogg", associated_deity: "Hanuman", difficulty_level: "beginner" },
    { title: "Achyutam Keshavam", artist: "Traditional", category: "bhajan", duration: 420, language: "hi", audio_url: "https://archive.org/download/achyutam-keshavam/achyutam-keshavam.ogg", associated_deity: "Krishna", difficulty_level: "beginner" },
    { title: "Bajrang Baan", artist: "Traditional", category: "mantra", duration: 600, language: "hi", audio_url: "https://archive.org/download/bajrang-baan/bajrang-baan.ogg", associated_deity: "Hanuman", difficulty_level: "intermediate" },
  ], { onConflict: "title", ignoreDuplicates: true });
  results.audio = aErr ? aErr.message : "ok";

  return new Response(JSON.stringify(results), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
