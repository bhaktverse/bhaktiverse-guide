export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_icon: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          points_required: number | null
          rarity: Database["public"]["Enums"]["rarity_type"] | null
        }
        Insert: {
          badge_icon?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          points_required?: number | null
          rarity?: Database["public"]["Enums"]["rarity_type"] | null
        }
        Update: {
          badge_icon?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          points_required?: number | null
          rarity?: Database["public"]["Enums"]["rarity_type"] | null
        }
        Relationships: []
      }
      ai_chat_sessions: {
        Row: {
          context_data: Json | null
          created_at: string | null
          id: string
          last_activity: string | null
          messages: Json | null
          session_type: Database["public"]["Enums"]["session_type"] | null
          user_id: string
        }
        Insert: {
          context_data?: Json | null
          created_at?: string | null
          id?: string
          last_activity?: string | null
          messages?: Json | null
          session_type?: Database["public"]["Enums"]["session_type"] | null
          user_id: string
        }
        Update: {
          context_data?: Json | null
          created_at?: string | null
          id?: string
          last_activity?: string | null
          messages?: Json | null
          session_type?: Database["public"]["Enums"]["session_type"] | null
          user_id?: string
        }
        Relationships: []
      }
      astro_profiles: {
        Row: {
          chart_hash: string | null
          created_at: string | null
          dasha_data: Json | null
          dob: string
          id: string
          lagna: Database["public"]["Enums"]["zodiac_sign"] | null
          name: string
          place: string | null
          planets_data: Json | null
          rashi: Database["public"]["Enums"]["zodiac_sign"] | null
          tob: string | null
          updated_at: string | null
          user_id: string
          yogas: Json | null
        }
        Insert: {
          chart_hash?: string | null
          created_at?: string | null
          dasha_data?: Json | null
          dob: string
          id?: string
          lagna?: Database["public"]["Enums"]["zodiac_sign"] | null
          name: string
          place?: string | null
          planets_data?: Json | null
          rashi?: Database["public"]["Enums"]["zodiac_sign"] | null
          tob?: string | null
          updated_at?: string | null
          user_id: string
          yogas?: Json | null
        }
        Update: {
          chart_hash?: string | null
          created_at?: string | null
          dasha_data?: Json | null
          dob?: string
          id?: string
          lagna?: Database["public"]["Enums"]["zodiac_sign"] | null
          name?: string
          place?: string | null
          planets_data?: Json | null
          rashi?: Database["public"]["Enums"]["zodiac_sign"] | null
          tob?: string | null
          updated_at?: string | null
          user_id?: string
          yogas?: Json | null
        }
        Relationships: []
      }
      audio_library: {
        Row: {
          artist: string | null
          associated_deity: string | null
          audio_url: string
          category: string
          created_at: string | null
          difficulty_level: string | null
          download_count: number | null
          duration: number
          id: string
          language: string
          lyrics: string | null
          meaning: string | null
          occasion: Json | null
          pronunciation_guide: string | null
          rating: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          artist?: string | null
          associated_deity?: string | null
          audio_url: string
          category: string
          created_at?: string | null
          difficulty_level?: string | null
          download_count?: number | null
          duration: number
          id?: string
          language: string
          lyrics?: string | null
          meaning?: string | null
          occasion?: Json | null
          pronunciation_guide?: string | null
          rating?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          artist?: string | null
          associated_deity?: string | null
          audio_url?: string
          category?: string
          created_at?: string | null
          difficulty_level?: string | null
          download_count?: number | null
          duration?: number
          id?: string
          language?: string
          lyrics?: string | null
          meaning?: string | null
          occasion?: Json | null
          pronunciation_guide?: string | null
          rating?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bhakti_shorts: {
        Row: {
          approved: boolean | null
          category: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          duration_seconds: number | null
          featured: boolean | null
          id: string
          likes_count: number | null
          tags: Json | null
          thumbnail_url: string | null
          title: string
          video_url: string
          views_count: number | null
        }
        Insert: {
          approved?: boolean | null
          category?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          duration_seconds?: number | null
          featured?: boolean | null
          id?: string
          likes_count?: number | null
          tags?: Json | null
          thumbnail_url?: string | null
          title: string
          video_url: string
          views_count?: number | null
        }
        Update: {
          approved?: boolean | null
          category?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          duration_seconds?: number | null
          featured?: boolean | null
          id?: string
          likes_count?: number | null
          tags?: Json | null
          thumbnail_url?: string | null
          title?: string
          video_url?: string
          views_count?: number | null
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          duration_hours: number | null
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          is_recurring: boolean | null
          recurrence_pattern: string | null
          regional_significance: Json | null
          reminder_enabled: boolean | null
          rituals: Json | null
          significance: string | null
          time: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          duration_hours?: number | null
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          regional_significance?: Json | null
          reminder_enabled?: boolean | null
          rituals?: Json | null
          significance?: string | null
          time?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          duration_hours?: number | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          is_recurring?: boolean | null
          recurrence_pattern?: string | null
          regional_significance?: Json | null
          reminder_enabled?: boolean | null
          rituals?: Json | null
          significance?: string | null
          time?: string | null
          title?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string | null
          featured: boolean | null
          id: string
          likes_count: number | null
          media_urls: Json | null
          post_type: Database["public"]["Enums"]["post_type"] | null
          shares_count: number | null
          tags: Json | null
          updated_at: string | null
          user_id: string
          visibility: Database["public"]["Enums"]["visibility_type"] | null
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string | null
          featured?: boolean | null
          id?: string
          likes_count?: number | null
          media_urls?: Json | null
          post_type?: Database["public"]["Enums"]["post_type"] | null
          shares_count?: number | null
          tags?: Json | null
          updated_at?: string | null
          user_id: string
          visibility?: Database["public"]["Enums"]["visibility_type"] | null
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string | null
          featured?: boolean | null
          id?: string
          likes_count?: number | null
          media_urls?: Json | null
          post_type?: Database["public"]["Enums"]["post_type"] | null
          shares_count?: number | null
          tags?: Json | null
          updated_at?: string | null
          user_id?: string
          visibility?: Database["public"]["Enums"]["visibility_type"] | null
        }
        Relationships: []
      }
      daily_devotions: {
        Row: {
          benefits: string | null
          color: string | null
          created_at: string | null
          day_of_week: number
          deity: string
          fast_recommendation: string | null
          id: string
          mantra: string | null
          planet: Database["public"]["Enums"]["planet_type"]
          puja_items: Json | null
          story: string | null
        }
        Insert: {
          benefits?: string | null
          color?: string | null
          created_at?: string | null
          day_of_week: number
          deity: string
          fast_recommendation?: string | null
          id?: string
          mantra?: string | null
          planet: Database["public"]["Enums"]["planet_type"]
          puja_items?: Json | null
          story?: string | null
        }
        Update: {
          benefits?: string | null
          color?: string | null
          created_at?: string | null
          day_of_week?: number
          deity?: string
          fast_recommendation?: string | null
          id?: string
          mantra?: string | null
          planet?: Database["public"]["Enums"]["planet_type"]
          puja_items?: Json | null
          story?: string | null
        }
        Relationships: []
      }
      divine_conversations: {
        Row: {
          confidence_score: number | null
          conversation_type: string | null
          created_at: string | null
          id: string
          input_text: string
          is_cached: boolean | null
          metadata: Json | null
          response_text: string
          topic: string | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          conversation_type?: string | null
          created_at?: string | null
          id?: string
          input_text: string
          is_cached?: boolean | null
          metadata?: Json | null
          response_text: string
          topic?: string | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          conversation_type?: string | null
          created_at?: string | null
          id?: string
          input_text?: string
          is_cached?: boolean | null
          metadata?: Json | null
          response_text?: string
          topic?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mantra_sessions: {
        Row: {
          completed: boolean | null
          count: number
          created_at: string | null
          duration_minutes: number | null
          id: string
          mantra_name: string
          session_date: string | null
          streak_day: number | null
          target_count: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          count?: number
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          mantra_name: string
          session_date?: string | null
          streak_day?: number | null
          target_count?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          count?: number
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          mantra_name?: string
          session_date?: string | null
          streak_day?: number | null
          target_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      mantras_library: {
        Row: {
          audio_url: string | null
          benefits: string | null
          best_time: string | null
          bija_mantra: string | null
          created_at: string | null
          deity: string | null
          id: string
          mantra: string
          meaning: string | null
          planet: Database["public"]["Enums"]["planet_type"] | null
          pronunciation: string | null
          repetitions: number | null
        }
        Insert: {
          audio_url?: string | null
          benefits?: string | null
          best_time?: string | null
          bija_mantra?: string | null
          created_at?: string | null
          deity?: string | null
          id?: string
          mantra: string
          meaning?: string | null
          planet?: Database["public"]["Enums"]["planet_type"] | null
          pronunciation?: string | null
          repetitions?: number | null
        }
        Update: {
          audio_url?: string | null
          benefits?: string | null
          best_time?: string | null
          bija_mantra?: string | null
          created_at?: string | null
          deity?: string | null
          id?: string
          mantra?: string
          meaning?: string | null
          planet?: Database["public"]["Enums"]["planet_type"] | null
          pronunciation?: string | null
          repetitions?: number | null
        }
        Relationships: []
      }
      numerology_reports: {
        Row: {
          ai_version: string | null
          birth_number: number | null
          created_at: string | null
          destiny_number: number | null
          detailed_analysis: Json | null
          dob: string
          expression_number: number | null
          id: string
          lucky_color: string | null
          lucky_day: string | null
          lucky_gemstone: string | null
          lucky_mantra: string | null
          name: string
          name_dob_hash: string | null
          personality_number: number | null
          remedies: Json | null
          report_text: string | null
          soul_number: number | null
          user_id: string
        }
        Insert: {
          ai_version?: string | null
          birth_number?: number | null
          created_at?: string | null
          destiny_number?: number | null
          detailed_analysis?: Json | null
          dob: string
          expression_number?: number | null
          id?: string
          lucky_color?: string | null
          lucky_day?: string | null
          lucky_gemstone?: string | null
          lucky_mantra?: string | null
          name: string
          name_dob_hash?: string | null
          personality_number?: number | null
          remedies?: Json | null
          report_text?: string | null
          soul_number?: number | null
          user_id: string
        }
        Update: {
          ai_version?: string | null
          birth_number?: number | null
          created_at?: string | null
          destiny_number?: number | null
          detailed_analysis?: Json | null
          dob?: string
          expression_number?: number | null
          id?: string
          lucky_color?: string | null
          lucky_day?: string | null
          lucky_gemstone?: string | null
          lucky_mantra?: string | null
          name?: string
          name_dob_hash?: string | null
          personality_number?: number | null
          remedies?: Json | null
          report_text?: string | null
          soul_number?: number | null
          user_id?: string
        }
        Relationships: []
      }
      palm_reading_history: {
        Row: {
          analysis: Json
          created_at: string | null
          id: string
          language: string | null
          palm_image_url: string | null
          palm_type: string | null
          user_id: string
        }
        Insert: {
          analysis: Json
          created_at?: string | null
          id?: string
          language?: string | null
          palm_image_url?: string | null
          palm_type?: string | null
          user_id: string
        }
        Update: {
          analysis?: Json
          created_at?: string | null
          id?: string
          language?: string | null
          palm_image_url?: string | null
          palm_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      playlists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          tracks: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          tracks?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          tracks?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          daily_goals: Json | null
          favorite_deities: Json | null
          id: string
          location_data: Json | null
          name: string
          notification_preferences: Json | null
          phone: string | null
          preferred_language: string | null
          spiritual_level: Database["public"]["Enums"]["spiritual_level"] | null
          streak_data: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          daily_goals?: Json | null
          favorite_deities?: Json | null
          id?: string
          location_data?: Json | null
          name: string
          notification_preferences?: Json | null
          phone?: string | null
          preferred_language?: string | null
          spiritual_level?:
            | Database["public"]["Enums"]["spiritual_level"]
            | null
          streak_data?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          daily_goals?: Json | null
          favorite_deities?: Json | null
          id?: string
          location_data?: Json | null
          name?: string
          notification_preferences?: Json | null
          phone?: string | null
          preferred_language?: string | null
          spiritual_level?:
            | Database["public"]["Enums"]["spiritual_level"]
            | null
          streak_data?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saints: {
        Row: {
          ai_model_fine_tuned: boolean | null
          audio_samples: Json | null
          biography: string | null
          birth_year: number | null
          created_at: string | null
          death_year: number | null
          famous_quotes: Json | null
          id: string
          image_url: string | null
          key_teachings: string | null
          name: string
          personality_traits: Json | null
          primary_language: string | null
          regional_names: Json | null
          tradition: string | null
          verified: boolean | null
        }
        Insert: {
          ai_model_fine_tuned?: boolean | null
          audio_samples?: Json | null
          biography?: string | null
          birth_year?: number | null
          created_at?: string | null
          death_year?: number | null
          famous_quotes?: Json | null
          id?: string
          image_url?: string | null
          key_teachings?: string | null
          name: string
          personality_traits?: Json | null
          primary_language?: string | null
          regional_names?: Json | null
          tradition?: string | null
          verified?: boolean | null
        }
        Update: {
          ai_model_fine_tuned?: boolean | null
          audio_samples?: Json | null
          biography?: string | null
          birth_year?: number | null
          created_at?: string | null
          death_year?: number | null
          famous_quotes?: Json | null
          id?: string
          image_url?: string | null
          key_teachings?: string | null
          name?: string
          personality_traits?: Json | null
          primary_language?: string | null
          regional_names?: Json | null
          tradition?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      scripture_chapters: {
        Row: {
          audio_url: string | null
          chapter_number: number
          content: string
          created_at: string | null
          id: string
          scripture_id: string | null
          summary: string | null
          title: string
          verse_count: number | null
        }
        Insert: {
          audio_url?: string | null
          chapter_number: number
          content: string
          created_at?: string | null
          id?: string
          scripture_id?: string | null
          summary?: string | null
          title: string
          verse_count?: number | null
        }
        Update: {
          audio_url?: string | null
          chapter_number?: number
          content?: string
          created_at?: string | null
          id?: string
          scripture_id?: string | null
          summary?: string | null
          title?: string
          verse_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scripture_chapters_scripture_id_fkey"
            columns: ["scripture_id"]
            isOneToOne: false
            referencedRelation: "scriptures"
            referencedColumns: ["id"]
          },
        ]
      }
      scriptures: {
        Row: {
          audio_url: string | null
          author: string | null
          created_at: string | null
          description: string | null
          difficulty_level:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          estimated_reading_time: number | null
          id: string
          language: string | null
          pdf_url: string | null
          summary: string | null
          title: string
          total_chapters: number | null
          tradition: string | null
          type: Database["public"]["Enums"]["scripture_type"] | null
        }
        Insert: {
          audio_url?: string | null
          author?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          estimated_reading_time?: number | null
          id?: string
          language?: string | null
          pdf_url?: string | null
          summary?: string | null
          title: string
          total_chapters?: number | null
          tradition?: string | null
          type?: Database["public"]["Enums"]["scripture_type"] | null
        }
        Update: {
          audio_url?: string | null
          author?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          estimated_reading_time?: number | null
          id?: string
          language?: string | null
          pdf_url?: string | null
          summary?: string | null
          title?: string
          total_chapters?: number | null
          tradition?: string | null
          type?: Database["public"]["Enums"]["scripture_type"] | null
        }
        Relationships: []
      }
      spiritual_content: {
        Row: {
          audio_pronunciation: string | null
          category: Database["public"]["Enums"]["content_category"]
          content: string
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string | null
          difficulty_level:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          duration: number | null
          engagement_metrics: Json | null
          id: string
          language: string | null
          media_url: string | null
          related_content: Json | null
          source_id: string | null
          source_type: Database["public"]["Enums"]["content_source_type"]
          summary: string | null
          tags: Json | null
          title: string | null
          transcript: string | null
        }
        Insert: {
          audio_pronunciation?: string | null
          category: Database["public"]["Enums"]["content_category"]
          content: string
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          duration?: number | null
          engagement_metrics?: Json | null
          id?: string
          language?: string | null
          media_url?: string | null
          related_content?: Json | null
          source_id?: string | null
          source_type: Database["public"]["Enums"]["content_source_type"]
          summary?: string | null
          tags?: Json | null
          title?: string | null
          transcript?: string | null
        }
        Update: {
          audio_pronunciation?: string | null
          category?: Database["public"]["Enums"]["content_category"]
          content?: string
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          duration?: number | null
          engagement_metrics?: Json | null
          id?: string
          language?: string | null
          media_url?: string | null
          related_content?: Json | null
          source_id?: string | null
          source_type?: Database["public"]["Enums"]["content_source_type"]
          summary?: string | null
          tags?: Json | null
          title?: string | null
          transcript?: string | null
        }
        Relationships: []
      }
      spiritual_faqs: {
        Row: {
          ai_generated: boolean | null
          answer: string
          category: Database["public"]["Enums"]["faq_category"]
          created_at: string | null
          difficulty_level:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          id: string
          language: string | null
          popularity_score: number | null
          question: string
          source_references: Json | null
          verified_by_scholar: boolean | null
        }
        Insert: {
          ai_generated?: boolean | null
          answer: string
          category: Database["public"]["Enums"]["faq_category"]
          created_at?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          id?: string
          language?: string | null
          popularity_score?: number | null
          question: string
          source_references?: Json | null
          verified_by_scholar?: boolean | null
        }
        Update: {
          ai_generated?: boolean | null
          answer?: string
          category?: Database["public"]["Enums"]["faq_category"]
          created_at?: string | null
          difficulty_level?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          id?: string
          language?: string | null
          popularity_score?: number | null
          question?: string
          source_references?: Json | null
          verified_by_scholar?: boolean | null
        }
        Relationships: []
      }
      spiritual_journey: {
        Row: {
          achievements: Json | null
          badges: Json | null
          consultations_done: number | null
          created_at: string | null
          current_quest: string | null
          experience_points: number | null
          id: string
          karma_score: number | null
          level: number | null
          mantras_chanted: number | null
          reports_generated: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achievements?: Json | null
          badges?: Json | null
          consultations_done?: number | null
          created_at?: string | null
          current_quest?: string | null
          experience_points?: number | null
          id?: string
          karma_score?: number | null
          level?: number | null
          mantras_chanted?: number | null
          reports_generated?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achievements?: Json | null
          badges?: Json | null
          consultations_done?: number | null
          created_at?: string | null
          current_quest?: string | null
          experience_points?: number | null
          id?: string
          karma_score?: number | null
          level?: number | null
          mantras_chanted?: number | null
          reports_generated?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      temples: {
        Row: {
          booking_enabled: boolean | null
          contact_info: Json | null
          created_at: string | null
          darshan_schedule: Json | null
          description: string | null
          entrance_fee: Json | null
          facilities: Json | null
          history: string | null
          id: string
          image_urls: Json | null
          live_darshan_url: string | null
          location: Json
          name: string
          primary_deity: string | null
          rating: number | null
          tradition: string | null
          updated_at: string | null
          verified: boolean | null
          visiting_hours: Json | null
          youtube_channel_id: string | null
        }
        Insert: {
          booking_enabled?: boolean | null
          contact_info?: Json | null
          created_at?: string | null
          darshan_schedule?: Json | null
          description?: string | null
          entrance_fee?: Json | null
          facilities?: Json | null
          history?: string | null
          id?: string
          image_urls?: Json | null
          live_darshan_url?: string | null
          location: Json
          name: string
          primary_deity?: string | null
          rating?: number | null
          tradition?: string | null
          updated_at?: string | null
          verified?: boolean | null
          visiting_hours?: Json | null
          youtube_channel_id?: string | null
        }
        Update: {
          booking_enabled?: boolean | null
          contact_info?: Json | null
          created_at?: string | null
          darshan_schedule?: Json | null
          description?: string | null
          entrance_fee?: Json | null
          facilities?: Json | null
          history?: string | null
          id?: string
          image_urls?: Json | null
          live_darshan_url?: string | null
          location?: Json
          name?: string
          primary_deity?: string | null
          rating?: number | null
          tradition?: string | null
          updated_at?: string | null
          verified?: boolean | null
          visiting_hours?: Json | null
          youtube_channel_id?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_data: Json | null
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at: string | null
          id: string
          points_earned: number | null
          streak_contribution: boolean | null
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at?: string | null
          id?: string
          points_earned?: number | null
          streak_contribution?: boolean | null
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: Database["public"]["Enums"]["activity_type"]
          created_at?: string | null
          id?: string
          points_earned?: number | null
          streak_contribution?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed: boolean | null
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          last_accessed: string | null
          last_position: number | null
          progress_percentage: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          last_position?: number | null
          progress_percentage?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          last_position?: number | null
          progress_percentage?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      activity_type:
        | "mantra_chant"
        | "scripture_read"
        | "meditation"
        | "darshan"
        | "donation"
        | "community_post"
        | "temple_visit"
      app_role: "admin" | "moderator" | "user"
      audio_category:
        | "mantra"
        | "bhajan"
        | "aarti"
        | "meditation"
        | "story"
        | "discourse"
      content_category:
        | "teaching"
        | "story"
        | "explanation"
        | "ritual"
        | "philosophy"
        | "devotional"
      content_source_type:
        | "saint"
        | "scripture"
        | "youtube"
        | "book"
        | "audio"
        | "user_generated"
      content_type: "text" | "audio" | "video" | "mantra" | "prayer"
      date_type: "fixed" | "lunar" | "solar"
      difficulty_level: "beginner" | "intermediate" | "advanced"
      event_type:
        | "festival"
        | "vrat"
        | "ekadashi"
        | "amavasya"
        | "purnima"
        | "personal"
      faq_category:
        | "rituals"
        | "philosophy"
        | "practices"
        | "festivals"
        | "mantras"
        | "meditation"
      festival_category: "major" | "regional" | "community" | "personal"
      moderation_status: "pending" | "approved" | "rejected"
      planet_type:
        | "sun"
        | "moon"
        | "mars"
        | "mercury"
        | "jupiter"
        | "venus"
        | "saturn"
        | "rahu"
        | "ketu"
      post_type:
        | "text"
        | "image"
        | "video"
        | "audio"
        | "experience"
        | "question"
      rarity_type: "common" | "rare" | "epic" | "legendary"
      scripture_type:
        | "scripture"
        | "commentary"
        | "devotional"
        | "philosophical"
        | "mantra"
      session_type:
        | "pooja_assistant"
        | "meditation_guide"
        | "astrology"
        | "general_spiritual"
        | "saint_specific"
      spiritual_category:
        | "devotion"
        | "experience"
        | "learning"
        | "ritual"
        | "festival"
        | "pilgrimage"
      spiritual_level: "beginner" | "seeker" | "devotee" | "sage"
      visibility_type: "public" | "followers" | "private"
      zodiac_sign:
        | "aries"
        | "taurus"
        | "gemini"
        | "cancer"
        | "leo"
        | "virgo"
        | "libra"
        | "scorpio"
        | "sagittarius"
        | "capricorn"
        | "aquarius"
        | "pisces"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: [
        "mantra_chant",
        "scripture_read",
        "meditation",
        "darshan",
        "donation",
        "community_post",
        "temple_visit",
      ],
      app_role: ["admin", "moderator", "user"],
      audio_category: [
        "mantra",
        "bhajan",
        "aarti",
        "meditation",
        "story",
        "discourse",
      ],
      content_category: [
        "teaching",
        "story",
        "explanation",
        "ritual",
        "philosophy",
        "devotional",
      ],
      content_source_type: [
        "saint",
        "scripture",
        "youtube",
        "book",
        "audio",
        "user_generated",
      ],
      content_type: ["text", "audio", "video", "mantra", "prayer"],
      date_type: ["fixed", "lunar", "solar"],
      difficulty_level: ["beginner", "intermediate", "advanced"],
      event_type: [
        "festival",
        "vrat",
        "ekadashi",
        "amavasya",
        "purnima",
        "personal",
      ],
      faq_category: [
        "rituals",
        "philosophy",
        "practices",
        "festivals",
        "mantras",
        "meditation",
      ],
      festival_category: ["major", "regional", "community", "personal"],
      moderation_status: ["pending", "approved", "rejected"],
      planet_type: [
        "sun",
        "moon",
        "mars",
        "mercury",
        "jupiter",
        "venus",
        "saturn",
        "rahu",
        "ketu",
      ],
      post_type: ["text", "image", "video", "audio", "experience", "question"],
      rarity_type: ["common", "rare", "epic", "legendary"],
      scripture_type: [
        "scripture",
        "commentary",
        "devotional",
        "philosophical",
        "mantra",
      ],
      session_type: [
        "pooja_assistant",
        "meditation_guide",
        "astrology",
        "general_spiritual",
        "saint_specific",
      ],
      spiritual_category: [
        "devotion",
        "experience",
        "learning",
        "ritual",
        "festival",
        "pilgrimage",
      ],
      spiritual_level: ["beginner", "seeker", "devotee", "sage"],
      visibility_type: ["public", "followers", "private"],
      zodiac_sign: [
        "aries",
        "taurus",
        "gemini",
        "cancer",
        "leo",
        "virgo",
        "libra",
        "scorpio",
        "sagittarius",
        "capricorn",
        "aquarius",
        "pisces",
      ],
    },
  },
} as const
