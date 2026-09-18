export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          caregiver_id: string | null
          child_id: string
          created_at: string
          data: Json
          ended_at: string | null
          family_id: string
          id: string
          notes: string | null
          photo_url: string | null
          started_at: string
          type: string
          updated_at: string
        }
        Insert: {
          caregiver_id?: string | null
          child_id: string
          created_at?: string
          data?: Json
          ended_at?: string | null
          family_id: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          started_at?: string
          type: string
          updated_at?: string
        }
        Update: {
          caregiver_id?: string | null
          child_id?: string
          created_at?: string
          data?: Json
          ended_at?: string | null
          family_id?: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          started_at?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_caregiver_id_fkey"
            columns: ["caregiver_id"]
            isOneToOne: false
            referencedRelation: "caregivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      caregivers: {
        Row: {
          created_at: string
          display_name: string
          family_id: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          family_id?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          family_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "caregivers_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      child_foods: {
        Row: {
          child_id: string
          first_tried_at: string
          food_id: string
        }
        Insert: {
          child_id: string
          first_tried_at?: string
          food_id: string
        }
        Update: {
          child_id?: string
          first_tried_at?: string
          food_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_foods_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_foods_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          birthdate: string | null
          created_at: string
          family_id: string
          first_name: string
          id: string
          sex: string
          use_adjusted_age: boolean
        }
        Insert: {
          birthdate?: string | null
          created_at?: string
          family_id: string
          first_name: string
          id?: string
          sex?: string
          use_adjusted_age?: boolean
        }
        Update: {
          birthdate?: string | null
          created_at?: string
          family_id?: string
          first_name?: string
          id?: string
          sex?: string
          use_adjusted_age?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "children_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          name?: string
        }
        Relationships: []
      }
      foods: {
        Row: {
          category: string
          created_at: string
          family_id: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          family_id?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          family_id?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "foods_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_family: {
        Args: { family_name: string }
        Returns: {
          created_at: string
          id: string
          invite_code: string
          name: string
        }
      }
      current_family_id: { Args: never; Returns: string }
      join_family: {
        Args: { code: string }
        Returns: {
          created_at: string
          id: string
          invite_code: string
          name: string
        }
      }
      update_display_name: { Args: { new_name: string }; Returns: undefined }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
