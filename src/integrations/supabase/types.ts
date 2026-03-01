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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      certificates: {
        Row: {
          certificate_url: string | null
          course_name: string
          created_at: string
          id: string
          issue_date: string
          student_id: string
        }
        Insert: {
          certificate_url?: string | null
          course_name: string
          created_at?: string
          id?: string
          issue_date: string
          student_id: string
        }
        Update: {
          certificate_url?: string | null
          course_name?: string
          created_at?: string
          id?: string
          issue_date?: string
          student_id?: string
        }
        Relationships: []
      }
      email_drip_queue: {
        Row: {
          created_at: string
          delay_hours: number | null
          id: string
          scheduled_at: string
          sent_at: string | null
          status: string | null
          step_name: string | null
          student_email: string | null
          student_id: string
          template_id: string | null
        }
        Insert: {
          created_at?: string
          delay_hours?: number | null
          id?: string
          scheduled_at?: string
          sent_at?: string | null
          status?: string | null
          step_name?: string | null
          student_email?: string | null
          student_id: string
          template_id?: string | null
        }
        Update: {
          created_at?: string
          delay_hours?: number | null
          id?: string
          scheduled_at?: string
          sent_at?: string | null
          status?: string | null
          step_name?: string | null
          student_email?: string | null
          student_id?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_drip_queue_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_drip_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_drip_templates: {
        Row: {
          created_at: string
          delay_hours: number | null
          enabled: boolean | null
          html: string | null
          id: string
          step_name: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          delay_hours?: number | null
          enabled?: boolean | null
          html?: string | null
          id?: string
          step_name?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          delay_hours?: number | null
          enabled?: boolean | null
          html?: string | null
          id?: string
          step_name?: string | null
          subject?: string
        }
        Relationships: []
      }
      freelance_interests: {
        Row: {
          created_at: string
          id: string
          project_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelance_interests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "freelance_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      freelance_projects: {
        Row: {
          budget: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          location: string | null
          title: string
        }
        Insert: {
          budget?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          title: string
        }
        Update: {
          budget?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string | null
          title?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_broadcast: boolean | null
          read_at: string | null
          receiver_id: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_broadcast?: boolean | null
          read_at?: string | null
          receiver_id?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_broadcast?: boolean | null
          read_at?: string | null
          receiver_id?: string | null
          sender_id?: string
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          used?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean
        }
        Relationships: []
      }
      payment_records: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          status: string | null
          student_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string | null
          student_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string | null
          student_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          experience_level: string | null
          full_name: string | null
          has_execution_plan: boolean | null
          has_paid: boolean | null
          has_trial: boolean | null
          id: string
          location: string | null
          mode: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          experience_level?: string | null
          full_name?: string | null
          has_execution_plan?: boolean | null
          has_paid?: boolean | null
          has_trial?: boolean | null
          id: string
          location?: string | null
          mode?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          experience_level?: string | null
          full_name?: string | null
          has_execution_plan?: boolean | null
          has_paid?: boolean | null
          has_trial?: boolean | null
          id?: string
          location?: string | null
          mode?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_visit_rsvp: {
        Row: {
          created_at: string
          id: string
          status: string
          student_id: string
          visit_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status: string
          student_id: string
          visit_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          student_id?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_visit_rsvp_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "site_visits"
            referencedColumns: ["id"]
          },
        ]
      }
      site_visits: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          location: string
          title: string
          visit_date: string
          visit_time: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location: string
          title: string
          visit_date: string
          visit_time: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          location?: string
          title?: string
          visit_date?: string
          visit_time?: string
        }
        Relationships: []
      }
      student_course_access: {
        Row: {
          course_id: string
          created_at: string
          id: string
          student_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          student_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          student_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      get_profiles_with_email: {
        Args: never
        Returns: {
          created_at: string
          email: string
          experience_level: string
          full_name: string
          has_execution_plan: boolean
          has_paid: boolean
          has_trial: boolean
          id: string
          location: string
          mode: string
          phone: string
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
