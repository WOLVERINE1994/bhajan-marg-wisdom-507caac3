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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      content_items: {
        Row: {
          content_hash: string | null
          created_at: string
          duration_seconds: number | null
          embedding_status: string
          fetched_at: string | null
          id: string
          is_demo_fixture: boolean
          language: string
          notes: string | null
          published_at: string | null
          review_status: string
          segmentation_status: string
          source_id: string
          title: string
          transcript_status: string
          url: string
          usage_notes: string
        }
        Insert: {
          content_hash?: string | null
          created_at?: string
          duration_seconds?: number | null
          embedding_status?: string
          fetched_at?: string | null
          id: string
          is_demo_fixture?: boolean
          language?: string
          notes?: string | null
          published_at?: string | null
          review_status?: string
          segmentation_status?: string
          source_id: string
          title: string
          transcript_status?: string
          url: string
          usage_notes?: string
        }
        Update: {
          content_hash?: string | null
          created_at?: string
          duration_seconds?: number | null
          embedding_status?: string
          fetched_at?: string | null
          id?: string
          is_demo_fixture?: boolean
          language?: string
          notes?: string | null
          published_at?: string | null
          review_status?: string
          segmentation_status?: string
          source_id?: string
          title?: string
          transcript_status?: string
          url?: string
          usage_notes?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_items_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      ingestion_jobs: {
        Row: {
          content_item_id: string | null
          created_at: string
          finished_at: string | null
          id: string
          kind: string
          message: string
          source_id: string
          status: string
        }
        Insert: {
          content_item_id?: string | null
          created_at?: string
          finished_at?: string | null
          id: string
          kind: string
          message?: string
          source_id: string
          status?: string
        }
        Update: {
          content_item_id?: string | null
          created_at?: string
          finished_at?: string | null
          id?: string
          kind?: string
          message?: string
          source_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingestion_jobs_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingestion_jobs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      segment_topics: {
        Row: {
          score: number
          segment_id: string
          topic_id: string
        }
        Insert: {
          score?: number
          segment_id: string
          topic_id: string
        }
        Update: {
          score?: number
          segment_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "segment_topics_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "transcript_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "segment_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          authority: string
          created_at: string
          description: string
          id: string
          ingestion_permitted: string
          name: string
          platform: string
          reliability: string
          url: string
          usage_notes: string
          verification_url: string | null
          verified: boolean
          verified_at: string | null
        }
        Insert: {
          authority?: string
          created_at?: string
          description?: string
          id: string
          ingestion_permitted?: string
          name: string
          platform: string
          reliability?: string
          url: string
          usage_notes?: string
          verification_url?: string | null
          verified?: boolean
          verified_at?: string | null
        }
        Update: {
          authority?: string
          created_at?: string
          description?: string
          id?: string
          ingestion_permitted?: string
          name?: string
          platform?: string
          reliability?: string
          url?: string
          usage_notes?: string
          verification_url?: string | null
          verified?: boolean
          verified_at?: string | null
        }
        Relationships: []
      }
      topics: {
        Row: {
          blurb: string
          example_questions: string[]
          id: string
          label_en: string
          label_hi: string
          slug: string
        }
        Insert: {
          blurb?: string
          example_questions?: string[]
          id: string
          label_en: string
          label_hi: string
          slug: string
        }
        Update: {
          blurb?: string
          example_questions?: string[]
          id?: string
          label_en?: string
          label_hi?: string
          slug?: string
        }
        Relationships: []
      }
      transcript_segments: {
        Row: {
          content_item_id: string
          created_at: string
          embedding_model: string | null
          end_seconds: number | null
          id: string
          is_demo_fixture: boolean
          language: string
          review_status: string
          segment_hash: string
          seq: number
          start_seconds: number | null
          text: string
          text_normalized: string
        }
        Insert: {
          content_item_id: string
          created_at?: string
          embedding_model?: string | null
          end_seconds?: number | null
          id: string
          is_demo_fixture?: boolean
          language?: string
          review_status?: string
          segment_hash: string
          seq: number
          start_seconds?: number | null
          text: string
          text_normalized?: string
        }
        Update: {
          content_item_id?: string
          created_at?: string
          embedding_model?: string | null
          end_seconds?: number | null
          id?: string
          is_demo_fixture?: boolean
          language?: string
          review_status?: string
          segment_hash?: string
          seq?: number
          start_seconds?: number | null
          text?: string
          text_normalized?: string
        }
        Relationships: [
          {
            foreignKeyName: "transcript_segments_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
