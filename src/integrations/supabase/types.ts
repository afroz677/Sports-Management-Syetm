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
      attendance: {
        Row: {
          attendance_id: string
          created_at: string
          date: string
          player_id: string
          status: string
          team_id: string
        }
        Insert: {
          attendance_id?: string
          created_at?: string
          date: string
          player_id: string
          status: string
          team_id: string
        }
        Update: {
          attendance_id?: string
          created_at?: string
          date?: string
          player_id?: string
          status?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "attendance_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      coaches: {
        Row: {
          coach_id: string
          contact_number: string
          created_at: string
          experience: number
          name: string
          specialization: string
        }
        Insert: {
          coach_id?: string
          contact_number: string
          created_at?: string
          experience?: number
          name: string
          specialization: string
        }
        Update: {
          coach_id?: string
          contact_number?: string
          created_at?: string
          experience?: number
          name?: string
          specialization?: string
        }
        Relationships: []
      }
      finance: {
        Row: {
          amount: number
          created_at: string
          finance_id: string
          invoice_number: string
          payment_date: string
          payment_status: string
          player_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          finance_id?: string
          invoice_number: string
          payment_date: string
          payment_status?: string
          player_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          finance_id?: string
          invoice_number?: string
          payment_date?: string
          payment_status?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
        ]
      }
      injuries: {
        Row: {
          created_at: string
          injury_date: string
          injury_id: string
          injury_type: string
          player_id: string
          recovery_status: string
          return_to_play_approval: boolean
        }
        Insert: {
          created_at?: string
          injury_date: string
          injury_id?: string
          injury_type: string
          player_id: string
          recovery_status?: string
          return_to_play_approval?: boolean
        }
        Update: {
          created_at?: string
          injury_date?: string
          injury_id?: string
          injury_type?: string
          player_id?: string
          recovery_status?: string
          return_to_play_approval?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "injuries_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["player_id"]
          },
        ]
      }
      players: {
        Row: {
          age: number
          contact_number: string
          created_at: string
          eligibility_status: string
          gender: string
          medical_history: string | null
          name: string
          player_id: string
          skill_level: string
          team_id: string | null
        }
        Insert: {
          age: number
          contact_number: string
          created_at?: string
          eligibility_status?: string
          gender: string
          medical_history?: string | null
          name: string
          player_id?: string
          skill_level: string
          team_id?: string | null
        }
        Update: {
          age?: number
          contact_number?: string
          created_at?: string
          eligibility_status?: string
          gender?: string
          medical_history?: string | null
          name?: string
          player_id?: string
          skill_level?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      schedules: {
        Row: {
          coach_id: string
          created_at: string
          date: string
          event_type: string
          schedule_id: string
          team_id: string
          time_slot: string
          venue_id: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          date: string
          event_type?: string
          schedule_id?: string
          team_id: string
          time_slot: string
          venue_id: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          date?: string
          event_type?: string
          schedule_id?: string
          team_id?: string
          time_slot?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["coach_id"]
          },
          {
            foreignKeyName: "schedules_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "schedules_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["venue_id"]
          },
        ]
      }
      teams: {
        Row: {
          coach_id: string | null
          created_at: string
          sport_type: string
          team_id: string
          team_name: string
        }
        Insert: {
          coach_id?: string | null
          created_at?: string
          sport_type: string
          team_id?: string
          team_name: string
        }
        Update: {
          coach_id?: string | null
          created_at?: string
          sport_type?: string
          team_id?: string
          team_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["coach_id"]
          },
        ]
      }
      venues: {
        Row: {
          availability_status: string
          capacity: number
          created_at: string
          location: string
          venue_id: string
          venue_name: string
        }
        Insert: {
          availability_status?: string
          capacity: number
          created_at?: string
          location: string
          venue_id?: string
          venue_name: string
        }
        Update: {
          availability_status?: string
          capacity?: number
          created_at?: string
          location?: string
          venue_id?: string
          venue_name?: string
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
