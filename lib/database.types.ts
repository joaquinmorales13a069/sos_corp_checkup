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
      audit_log: {
        Row: {
          accion: string
          created_at: string | null
          id: string
          ip_address: string | null
          recurso: string | null
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          accion: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          recurso?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          accion?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          recurso?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chequeos: {
        Row: {
          año: number
          created_at: string | null
          drive_url: string
          id: string
          sucursal_id: string
        }
        Insert: {
          año: number
          created_at?: string | null
          drive_url: string
          id?: string
          sucursal_id: string
        }
        Update: {
          año?: number
          created_at?: string | null
          drive_url?: string
          id?: string
          sucursal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chequeos_sucursal_id_fkey"
            columns: ["sucursal_id"]
            isOneToOne: false
            referencedRelation: "sucursales"
            referencedColumns: ["id"]
          },
        ]
      }
      chequeos_pre_empleo: {
        Row: {
          año: number
          created_at: string | null
          dia: number
          drive_url: string
          id: string
          mes: number
          sucursal_id: string
        }
        Insert: {
          año: number
          created_at?: string | null
          dia: number
          drive_url: string
          id?: string
          mes: number
          sucursal_id: string
        }
        Update: {
          año?: number
          created_at?: string | null
          dia?: number
          drive_url?: string
          id?: string
          mes?: number
          sucursal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chequeos_pre_empleo_sucursal_id_fkey"
            columns: ["sucursal_id"]
            isOneToOne: false
            referencedRelation: "sucursales"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          nombre: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          nombre: string
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          nombre?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          nombre: string
          rol: string
        }
        Insert: {
          created_at?: string | null
          id: string
          nombre: string
          rol: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nombre?: string
          rol?: string
        }
        Relationships: []
      }
      responsable_empresa: {
        Row: {
          empresa_id: string
          usuario_id: string
        }
        Insert: {
          empresa_id: string
          usuario_id: string
        }
        Update: {
          empresa_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "responsable_empresa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responsable_empresa_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sucursales: {
        Row: {
          created_at: string | null
          empresa_id: string
          id: string
          nombre: string
        }
        Insert: {
          created_at?: string | null
          empresa_id: string
          id?: string
          nombre: string
        }
        Update: {
          created_at?: string | null
          empresa_id?: string
          id?: string
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "sucursales_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
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
