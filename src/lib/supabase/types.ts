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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          hidden: boolean
          id: string
          is_anonymous: boolean
          project_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          hidden?: boolean
          id?: string
          is_anonymous?: boolean
          project_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          hidden?: boolean
          id?: string
          is_anonymous?: boolean
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_submissions: {
        Row: {
          competition_id: string
          created_at: string
          description: string | null
          id: string
          loom_url: string | null
          submission_url: string
          submitter_id: string
        }
        Insert: {
          competition_id: string
          created_at?: string
          description?: string | null
          id?: string
          loom_url?: string | null
          submission_url: string
          submitter_id: string
        }
        Update: {
          competition_id?: string
          created_at?: string
          description?: string | null
          id?: string
          loom_url?: string | null
          submission_url?: string
          submitter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_submissions_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_submissions_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          created_at: string
          creator_id: string
          deadline: string
          description: string
          id: string
          loom_url: string | null
          prize_amount: number
          review_status: string
          slug: string
          status: Database["public"]["Enums"]["competition_status"]
          tags: string[]
          title: string
          winner_submission_id: string | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          deadline: string
          description: string
          id?: string
          loom_url?: string | null
          prize_amount: number
          review_status?: string
          slug: string
          status?: Database["public"]["Enums"]["competition_status"]
          tags?: string[]
          title: string
          winner_submission_id?: string | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          deadline?: string
          description?: string
          id?: string
          loom_url?: string | null
          prize_amount?: number
          review_status?: string
          slug?: string
          status?: Database["public"]["Enums"]["competition_status"]
          tags?: string[]
          title?: string
          winner_submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitions_winner_fk"
            columns: ["winner_submission_id"]
            isOneToOne: false
            referencedRelation: "competition_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          id: string
          location: string | null
          starts_at: string | null
          title: string
          url: string | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          location?: string | null
          starts_at?: string | null
          title: string
          url?: string | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          location?: string | null
          starts_at?: string | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          about_id: string | null
          about_type: string | null
          created_at: string
          id: string
          last_message_at: string
          participant_a: string
          participant_b: string
        }
        Insert: {
          about_id?: string | null
          about_type?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          participant_a: string
          participant_b: string
        }
        Update: {
          about_id?: string | null
          about_type?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          participant_a?: string
          participant_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_participant_a_fkey"
            columns: ["participant_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_b_fkey"
            columns: ["participant_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      directory_listings: {
        Row: {
          category: string
          contact: Json
          created_at: string
          id: string
          logo_url: string | null
          name: string
          status: string
          submitted_by: string | null
          wants: string | null
          what_you_do: string
        }
        Insert: {
          category: string
          contact?: Json
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          status?: string
          submitted_by?: string | null
          wants?: string | null
          what_you_do: string
        }
        Update: {
          category?: string
          contact?: Json
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          status?: string
          submitted_by?: string | null
          wants?: string | null
          what_you_do?: string
        }
        Relationships: []
      }
      event_requests: {
        Row: {
          contact: string
          created_at: string
          details: string
          id: string
          requester_id: string | null
          status: string
          title: string
        }
        Insert: {
          contact: string
          created_at?: string
          details: string
          id?: string
          requester_id?: string | null
          status?: string
          title: string
        }
        Update: {
          contact?: string
          created_at?: string
          details?: string
          id?: string
          requester_id?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          body: string
          created_at: string
          id: string
          is_anonymous: boolean
          page_url: string | null
          sentiment: string | null
          status: string
          submitter_contact: string | null
          submitter_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          page_url?: string | null
          sentiment?: string | null
          status?: string
          submitter_contact?: string | null
          submitter_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          page_url?: string | null
          sentiment?: string | null
          status?: string
          submitter_contact?: string | null
          submitter_id?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          builder_id: string
          created_at: string
          follower_id: string
        }
        Insert: {
          builder_id: string
          created_at?: string
          follower_id: string
        }
        Update: {
          builder_id?: string
          created_at?: string
          follower_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_builder_id_fkey"
            columns: ["builder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gig_threads: {
        Row: {
          applicant_id: string
          created_at: string
          gig_id: string
          id: string
        }
        Insert: {
          applicant_id: string
          created_at?: string
          gig_id: string
          id?: string
        }
        Update: {
          applicant_id?: string
          created_at?: string
          gig_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gig_threads_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gig_threads_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
        ]
      }
      gigs: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          created_at: string
          description: string
          hourly_rate: number | null
          id: string
          loom_url: string | null
          poster_id: string
          slug: string
          status: Database["public"]["Enums"]["gig_status"]
          tags: string[]
          title: string
          type: Database["public"]["Enums"]["gig_type"]
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          description: string
          hourly_rate?: number | null
          id?: string
          loom_url?: string | null
          poster_id: string
          slug: string
          status?: Database["public"]["Enums"]["gig_status"]
          tags?: string[]
          title: string
          type: Database["public"]["Enums"]["gig_type"]
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          description?: string
          hourly_rate?: number | null
          id?: string
          loom_url?: string | null
          poster_id?: string
          slug?: string
          status?: Database["public"]["Enums"]["gig_status"]
          tags?: string[]
          title?: string
          type?: Database["public"]["Enums"]["gig_type"]
        }
        Relationships: [
          {
            foreignKeyName: "gigs_poster_id_fkey"
            columns: ["poster_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interests: {
        Row: {
          created_at: string
          id: string
          kind: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string | null
          created_at: string
          file_url: string | null
          id: string
          sender_id: string
          thread_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          sender_id: string
          thread_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "gig_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          created_at: string
          data: Json
          entity_id: string | null
          entity_type: string | null
          id: string
          read_at: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          data?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          read_at?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          data?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          read_at?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          available_for_hire: boolean
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string
          dm_privacy: Database["public"]["Enums"]["dm_privacy"]
          follower_count: number
          handle: string
          hourly_rate: number | null
          id: string
          is_admin: boolean
          is_builder: boolean
          is_public: boolean
          is_verified: boolean
          went_public_at: string | null
          links: Json
          location: string | null
          name: string
          notification_prefs: Json
          show_real_name: boolean
          skills: string[]
          tags: string[]
          tools: string[]
          updated_at: string
        }
        Insert: {
          available_for_hire?: boolean
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          dm_privacy?: Database["public"]["Enums"]["dm_privacy"]
          follower_count?: number
          handle: string
          hourly_rate?: number | null
          id: string
          is_admin?: boolean
          is_builder?: boolean
          is_public?: boolean
          is_verified?: boolean
          went_public_at?: string | null
          links?: Json
          location?: string | null
          name: string
          notification_prefs?: Json
          show_real_name?: boolean
          skills?: string[]
          tags?: string[]
          tools?: string[]
          updated_at?: string
        }
        Update: {
          available_for_hire?: boolean
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          dm_privacy?: Database["public"]["Enums"]["dm_privacy"]
          follower_count?: number
          handle?: string
          hourly_rate?: number | null
          id?: string
          is_admin?: boolean
          is_builder?: boolean
          is_public?: boolean
          is_verified?: boolean
          went_public_at?: string | null
          links?: Json
          location?: string | null
          name?: string
          notification_prefs?: Json
          show_real_name?: boolean
          skills?: string[]
          tags?: string[]
          tools?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string
          featured: boolean
          for_sale: boolean
          hidden: boolean
          id: string
          image_url: string | null
          images: string[]
          is_anonymous: boolean
          name: string
          open_to_partners: boolean
          owner_id: string
          seeking_funding: boolean
          tags: string[]
          tools: string[]
          updated_at: string
          upvote_count: number
          url: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description: string
          featured?: boolean
          for_sale?: boolean
          hidden?: boolean
          id?: string
          image_url?: string | null
          images?: string[]
          is_anonymous?: boolean
          name: string
          open_to_partners?: boolean
          owner_id: string
          seeking_funding?: boolean
          tags?: string[]
          tools?: string[]
          updated_at?: string
          upvote_count?: number
          url?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          featured?: boolean
          for_sale?: boolean
          hidden?: boolean
          id?: string
          image_url?: string | null
          images?: string[]
          is_anonymous?: boolean
          name?: string
          open_to_partners?: boolean
          owner_id?: string
          seeking_funding?: boolean
          tags?: string[]
          tools?: string[]
          updated_at?: string
          upvote_count?: number
          url?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saves: {
        Row: {
          created_at: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saves_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      upvotes: {
        Row: {
          created_at: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upvotes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upvotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      notify: {
        Args: {
          p_actor?: string
          p_data?: Json
          p_entity_id?: string
          p_entity_type?: string
          p_type: string
          p_user: string
        }
        Returns: undefined
      }
    }
    Enums: {
      competition_status: "open" | "judging" | "closed"
      dm_privacy: "everyone" | "followers" | "none"
      gig_status: "open" | "in_progress" | "closed"
      gig_type: "task" | "hourly" | "build"
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
      competition_status: ["open", "judging", "closed"],
      dm_privacy: ["everyone", "followers", "none"],
      gig_status: ["open", "in_progress", "closed"],
      gig_type: ["task", "hourly", "build"],
    },
  },
} as const
