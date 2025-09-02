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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
      faq_category:
        | "rituals"
        | "philosophy"
        | "practices"
        | "festivals"
        | "mantras"
        | "meditation"
      festival_category: "major" | "regional" | "community" | "personal"
      moderation_status: "pending" | "approved" | "rejected"
      post_type:
        | "text"
        | "image"
        | "video"
        | "audio"
        | "experience"
        | "question"
      scripture_type:
        | "scripture"
        | "commentary"
        | "devotional"
        | "philosophical"
        | "mantra"
      spiritual_category:
        | "devotion"
        | "experience"
        | "learning"
        | "ritual"
        | "festival"
        | "pilgrimage"
      spiritual_level: "beginner" | "seeker" | "devotee" | "sage"
      visibility_type: "public" | "followers" | "private"
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
      post_type: ["text", "image", "video", "audio", "experience", "question"],
      scripture_type: [
        "scripture",
        "commentary",
        "devotional",
        "philosophical",
        "mantra",
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
    },
  },
} as const
