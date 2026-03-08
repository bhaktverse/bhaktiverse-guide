import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Find festivals happening tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const { data: events } = await supabase
      .from('calendar_events')
      .select('id, title, description')
      .eq('date', tomorrowStr)
      .in('event_type', ['festival', 'vrat', 'ekadashi', 'purnima']);

    if (!events || events.length === 0) {
      return new Response(JSON.stringify({ message: 'No festivals tomorrow' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all users who want festival notifications
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, notification_preferences');

    const usersToNotify = profiles?.filter(p => {
      const prefs = p.notification_preferences as any;
      return prefs?.festivals !== false;
    }) || [];

    let notifCount = 0;

    for (const event of events) {
      const notifications = usersToNotify.map(u => ({
        user_id: u.user_id,
        type: 'festival',
        title: `🪔 ${event.title} - Tomorrow!`,
        message: event.description || `Don't forget to prepare for ${event.title} tomorrow.`,
        data: { event_id: event.id },
      }));

      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications);
        notifCount += notifications.length;
      }
    }

    return new Response(JSON.stringify({ 
      message: `Sent ${notifCount} festival notifications for ${events.length} events` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Festival notifications error:', error);
    return new Response(JSON.stringify({ error: 'Service temporarily unavailable' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
