export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action_data: Json | null
          action_type: string
          admin_user_id: string
          created_at: string | null
          id: string
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action_data?: Json | null
          action_type: string
          admin_user_id: string
          created_at?: string | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action_data?: Json | null
          action_type?: string
          admin_user_id?: string
          created_at?: string | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          last_modified: string | null
          sync_version: number | null
          title: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          last_modified?: string | null
          sync_version?: number | null
          title: string
          type?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          last_modified?: string | null
          sync_version?: number | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          capital: string | null
          created_at: string
          difficulty: string
          flag_emoji: string
          gdp: number | null
          id: string
          name: string
          population: number | null
          power_level: number
          region: string
          updated_at: string
        }
        Insert: {
          capital?: string | null
          created_at?: string
          difficulty: string
          flag_emoji: string
          gdp?: number | null
          id?: string
          name: string
          population?: number | null
          power_level: number
          region: string
          updated_at?: string
        }
        Update: {
          capital?: string | null
          created_at?: string
          difficulty?: string
          flag_emoji?: string
          gdp?: number | null
          id?: string
          name?: string
          population?: number | null
          power_level?: number
          region?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_support: {
        Row: {
          admin_response: string | null
          ai_response: string | null
          compensation_points: number | null
          created_at: string | null
          id: string
          message: string
          resolved: boolean | null
          user_id: string | null
        }
        Insert: {
          admin_response?: string | null
          ai_response?: string | null
          compensation_points?: number | null
          created_at?: string | null
          id?: string
          message: string
          resolved?: boolean | null
          user_id?: string | null
        }
        Update: {
          admin_response?: string | null
          ai_response?: string | null
          compensation_points?: number | null
          created_at?: string | null
          id?: string
          message?: string
          resolved?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      exchanges: {
        Row: {
          id: string
          last_modified: string | null
          processed_by: string | null
          processed_date: string | null
          product_id: string
          quantity: number
          request_date: string
          status: string
          sync_version: number | null
          total_price: number
          user_id: string
        }
        Insert: {
          id?: string
          last_modified?: string | null
          processed_by?: string | null
          processed_date?: string | null
          product_id: string
          quantity?: number
          request_date?: string
          status?: string
          sync_version?: number | null
          total_price: number
          user_id: string
        }
        Update: {
          id?: string
          last_modified?: string | null
          processed_by?: string | null
          processed_date?: string | null
          product_id?: string
          quantity?: number
          request_date?: string
          status?: string
          sync_version?: number | null
          total_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exchanges_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exchanges_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exchanges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_session_participants: {
        Row: {
          id: string
          is_online: boolean | null
          joined_at: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_online?: boolean | null
          joined_at?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_online?: boolean | null
          joined_at?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          created_at: string | null
          game_type: string
          host_user_id: string
          id: string
          is_active: boolean | null
          max_players: number | null
          session_data: Json
          session_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          game_type: string
          host_user_id: string
          id?: string
          is_active?: boolean | null
          max_players?: number | null
          session_data?: Json
          session_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          game_type?: string
          host_user_id?: string
          id?: string
          is_active?: boolean | null
          max_players?: number | null
          session_data?: Json
          session_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      game_sessions_mw2: {
        Row: {
          country_id: string
          created_at: string
          game_state: Json
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          country_id: string
          created_at?: string
          game_state?: Json
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          country_id?: string
          created_at?: string
          game_state?: Json
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_mw2_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          expires_at: string
          id: string
          is_active: boolean
          last_modified: string | null
          points: number
          sync_version: number | null
          used_by: string[] | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          expires_at: string
          id?: string
          is_active?: boolean
          last_modified?: string | null
          points: number
          sync_version?: number | null
          used_by?: string[] | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean
          last_modified?: string | null
          points?: number
          sync_version?: number | null
          used_by?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_actions_mw2: {
        Row: {
          action_data: Json
          action_type: string
          id: string
          session_id: string
          timestamp: string
        }
        Insert: {
          action_data?: Json
          action_type: string
          id?: string
          session_id: string
          timestamp?: string
        }
        Update: {
          action_data?: Json
          action_type?: string
          id?: string
          session_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_actions_mw2_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions_mw2"
            referencedColumns: ["id"]
          },
        ]
      }
      points_transactions: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      pokemon_battles: {
        Row: {
          created_at: string
          id: string
          player1_deck: string[]
          player1_id: string
          player2_deck: string[] | null
          player2_id: string | null
          status: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          player1_deck: string[]
          player1_id: string
          player2_deck?: string[] | null
          player2_id?: string | null
          status?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          player1_deck?: string[]
          player1_id?: string
          player2_deck?: string[] | null
          player2_id?: string | null
          status?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pokemon_battles_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pokemon_battles_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pokemon_battles_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pokemon_cards: {
        Row: {
          attack: number
          created_at: string
          defense: number
          evolution_stage: number
          generation: number
          hp: number
          id: string
          image_url: string | null
          is_legendary: boolean
          is_mythical: boolean
          name: string
          name_en: string
          pokemon_id: number
          rarity: string
          sp_attack: number
          sp_defense: number
          speed: number
          total_stats: number
          type1: string
          type2: string | null
        }
        Insert: {
          attack: number
          created_at?: string
          defense: number
          evolution_stage?: number
          generation: number
          hp: number
          id?: string
          image_url?: string | null
          is_legendary?: boolean
          is_mythical?: boolean
          name: string
          name_en: string
          pokemon_id: number
          rarity: string
          sp_attack: number
          sp_defense: number
          speed: number
          total_stats: number
          type1: string
          type2?: string | null
        }
        Update: {
          attack?: number
          created_at?: string
          defense?: number
          evolution_stage?: number
          generation?: number
          hp?: number
          id?: string
          image_url?: string | null
          is_legendary?: boolean
          is_mythical?: boolean
          name?: string
          name_en?: string
          pokemon_id?: number
          rarity?: string
          sp_attack?: number
          sp_defense?: number
          speed?: number
          total_stats?: number
          type1?: string
          type2?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          last_modified: string | null
          name: string
          price: number
          stock: number
          sync_version: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          last_modified?: string | null
          name: string
          price: number
          stock?: number
          sync_version?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          last_modified?: string | null
          name?: string
          price?: number
          stock?: number
          sync_version?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          check_in_streak: number | null
          created_at: string | null
          display_name: string | null
          email_username: string | null
          id: string
          join_date: string | null
          last_check_in: string | null
          last_vip_bonus: string | null
          points: number | null
          role: string | null
          updated_at: string | null
          username: string | null
          vip_level: number | null
        }
        Insert: {
          avatar_url?: string | null
          check_in_streak?: number | null
          created_at?: string | null
          display_name?: string | null
          email_username?: string | null
          id: string
          join_date?: string | null
          last_check_in?: string | null
          last_vip_bonus?: string | null
          points?: number | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
          vip_level?: number | null
        }
        Update: {
          avatar_url?: string | null
          check_in_streak?: number | null
          created_at?: string | null
          display_name?: string | null
          email_username?: string | null
          id?: string
          join_date?: string | null
          last_check_in?: string | null
          last_vip_bonus?: string | null
          points?: number | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
          vip_level?: number | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      user_game_data: {
        Row: {
          created_at: string | null
          game_data: Json
          game_type: string
          id: string
          last_played: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          game_data?: Json
          game_type: string
          id?: string
          last_played?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          game_data?: Json
          game_type?: string
          id?: string
          last_played?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_pokemon_cards: {
        Row: {
          card_id: string
          id: string
          obtained_at: string
          quantity: number
          user_id: string
        }
        Insert: {
          card_id: string
          id?: string
          obtained_at?: string
          quantity?: number
          user_id: string
        }
        Update: {
          card_id?: string
          id?: string
          obtained_at?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_pokemon_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "pokemon_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_pokemon_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sync_data: {
        Row: {
          created_at: string | null
          data_content: Json
          data_type: string
          id: string
          last_modified: string | null
          sync_version: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_content?: Json
          data_type: string
          id?: string
          last_modified?: string | null
          sync_version?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_content?: Json
          data_type?: string
          id?: string
          last_modified?: string | null
          sync_version?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_sync_status: {
        Row: {
          created_at: string
          id: string
          is_online: boolean | null
          last_sync_at: string | null
          sync_version: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_online?: boolean | null
          last_sync_at?: string | null
          sync_version?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_online?: boolean | null
          last_sync_at?: string | null
          sync_version?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      簽到系統: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_id_by_username: {
        Args: { username_input: string }
        Returns: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
