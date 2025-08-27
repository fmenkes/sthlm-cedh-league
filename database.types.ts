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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      commander: {
        Row: {
          art_crop: string | null
          created_at: string
          id: number
          name: string
          partner: boolean | null
          scryfall_id: string | null
          src: string | null
        }
        Insert: {
          art_crop?: string | null
          created_at?: string
          id?: number
          name: string
          partner?: boolean | null
          scryfall_id?: string | null
          src?: string | null
        }
        Update: {
          art_crop?: string | null
          created_at?: string
          id?: number
          name?: string
          partner?: boolean | null
          scryfall_id?: string | null
          src?: string | null
        }
        Relationships: []
      }
      deck: {
        Row: {
          commander: number
          created_at: string
          id: number
          nickname: string | null
          normalized_pair: string | null
          partner: number | null
        }
        Insert: {
          commander: number
          created_at?: string
          id?: number
          nickname?: string | null
          normalized_pair?: string | null
          partner?: number | null
        }
        Update: {
          commander?: number
          created_at?: string
          id?: number
          nickname?: string | null
          normalized_pair?: string | null
          partner?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deck_commander_fk"
            columns: ["commander"]
            isOneToOne: false
            referencedRelation: "commander"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deck_partner_fk"
            columns: ["partner"]
            isOneToOne: false
            referencedRelation: "commander"
            referencedColumns: ["id"]
          },
        ]
      }
      game: {
        Row: {
          created_at: string
          draw: boolean
          id: number
          played_at: string | null
          season: number | null
          winner: number | null
        }
        Insert: {
          created_at?: string
          draw?: boolean
          id?: never
          played_at?: string | null
          season?: number | null
          winner?: number | null
        }
        Update: {
          created_at?: string
          draw?: boolean
          id?: never
          played_at?: string | null
          season?: number | null
          winner?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_season_fkey"
            columns: ["season"]
            isOneToOne: false
            referencedRelation: "season"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_winner_fkey"
            columns: ["winner"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_winner_fkey"
            columns: ["winner"]
            isOneToOne: false
            referencedRelation: "player_win_loss_draw_view"
            referencedColumns: ["id"]
          },
        ]
      }
      game_player: {
        Row: {
          deck: number | null
          game_id: number
          player_id: number
          seat: number | null
        }
        Insert: {
          deck?: number | null
          game_id: number
          player_id: number
          seat?: number | null
        }
        Update: {
          deck?: number | null
          game_id?: number
          player_id?: number
          seat?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_player_deck_fkey"
            columns: ["deck"]
            isOneToOne: false
            referencedRelation: "deck"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_player_deck_fkey"
            columns: ["deck"]
            isOneToOne: false
            referencedRelation: "player_win_loss_draw_view"
            referencedColumns: ["most_played_deck_id"]
          },
          {
            foreignKeyName: "game_player_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "game"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_player_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_player_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_win_loss_draw_view"
            referencedColumns: ["id"]
          },
        ]
      }
      player: {
        Row: {
          created_at: string
          id: number
          last_played: number | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          last_played?: number | null
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          last_played?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_last_played_fkey"
            columns: ["last_played"]
            isOneToOne: false
            referencedRelation: "deck"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_last_played_fkey"
            columns: ["last_played"]
            isOneToOne: false
            referencedRelation: "player_win_loss_draw_view"
            referencedColumns: ["most_played_deck_id"]
          },
        ]
      }
      season: {
        Row: {
          created_at: string
          ends_at: string | null
          id: number
          name: string | null
          starts_at: string | null
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: never
          name?: string | null
          starts_at?: string | null
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: never
          name?: string | null
          starts_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      deck_win_percentage: {
        Row: {
          deck: number | null
          total_games: number | null
          win_percentage: number | null
          wins: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_player_deck_fkey"
            columns: ["deck"]
            isOneToOne: false
            referencedRelation: "deck"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_player_deck_fkey"
            columns: ["deck"]
            isOneToOne: false
            referencedRelation: "player_win_loss_draw_view"
            referencedColumns: ["most_played_deck_id"]
          },
        ]
      }
      player_win_loss_draw_view: {
        Row: {
          commander_art_crop: string | null
          draws: number | null
          games_played: number | null
          id: number | null
          losses: number | null
          most_played_deck_id: number | null
          name: string | null
          partner_art_crop: string | null
          win_percentage: number | null
          wins: number | null
        }
        Relationships: []
      }
      seat_win_percentage_view: {
        Row: {
          seat: number | null
          win_percentage: number | null
          wins: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_player_stats_by_season: {
        Args: { season_id: number }
        Returns: {
          commander_art_crop: string
          draws: number
          games_played: number
          id: number
          losses: number
          most_played_deck_id: number
          name: string
          partner_art_crop: string
          win_percentage: number
          wins: number
        }[]
      }
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
