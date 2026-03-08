import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Verify the user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const userId = user.id;

    // Use service role to delete all user data
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Delete from all user-related tables (order matters for FK constraints)
    const tables = [
      'post_comments',
      'post_likes',
      'community_posts',
      'notifications',
      'user_achievements',
      'user_activities',
      'user_favorites',
      'user_progress',
      'user_api_usage',
      'playlists',
      'mantra_sessions',
      'divine_conversations',
      'ai_chat_sessions',
      'palm_reading_history',
      'numerology_reports',
      'kundali_match_history',
      'astro_profiles',
      'spiritual_journey',
      'user_roles',
      'profiles',
    ];

    for (const table of tables) {
      await adminClient.from(table).delete().eq('user_id', userId);
    }

    // Clean up storage files
    try {
      const { data: postFiles } = await adminClient.storage.from('community-media').list(`posts/${userId}`);
      if (postFiles?.length) {
        await adminClient.storage.from('community-media').remove(postFiles.map(f => `posts/${userId}/${f.name}`));
      }
      // Remove avatar files
      const { data: allFiles } = await adminClient.storage.from('community-media').list('avatars');
      if (allFiles?.length) {
        const userAvatars = allFiles.filter(f => f.name.startsWith(userId));
        if (userAvatars.length) {
          await adminClient.storage.from('community-media').remove(userAvatars.map(f => `avatars/${f.name}`));
        }
      }
    } catch (storageError) {
      console.error('Storage cleanup error (non-fatal):', storageError);
    }

    // Delete user from auth
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('Error deleting auth user:', deleteError);
      return new Response(JSON.stringify({ error: 'Failed to delete account. Data has been removed.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Delete user data error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
