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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      app_roles: {
        Row: {
          created_at: string | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      athlete_followers: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      athlete_media: {
        Row: {
          created_at: string
          file_type: string
          file_url: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_type: string
          file_url: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_type?: string
          file_url?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      athlete_media_likes: {
        Row: {
          created_at: string | null
          id: string
          media_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          media_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          media_id?: string
          user_id?: string
        }
        Relationships: []
      }
      athlete_photos: {
        Row: {
          created_at: string | null
          id: string
          photo_url: string
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          photo_url: string
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          photo_url?: string
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      athlete_stories: {
        Row: {
          caption: string | null
          created_at: string
          duration: number | null
          expires_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string
          story_type: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          duration?: number | null
          expires_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type: string
          story_type: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          duration?: number | null
          expires_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string
          story_type?: string
          user_id?: string
        }
        Relationships: []
      }
      athlete_videos: {
        Row: {
          created_at: string | null
          id: string
          pdf_url: string | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
          user_id: string
          video_url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pdf_url?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          video_url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pdf_url?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          video_url?: string
        }
        Relationships: []
      }
      favorite_athletes: {
        Row: {
          athlete_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          athlete_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          athlete_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      favorite_peneiras: {
        Row: {
          created_at: string
          id: string
          peneira_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          peneira_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          peneira_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_peneiras_peneira_id_fkey"
            columns: ["peneira_id"]
            isOneToOne: false
            referencedRelation: "peneiras"
            referencedColumns: ["id"]
          },
        ]
      }
      media_files: {
        Row: {
          caption: string | null
          category: string
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string
          user_id: string | null
        }
        Insert: {
          caption?: string | null
          category: string
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type: string
          user_id?: string | null
        }
        Update: {
          caption?: string | null
          category?: string
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      media_tags: {
        Row: {
          created_at: string
          id: string
          media_id: string
          tag: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_id: string
          tag: string
        }
        Update: {
          created_at?: string
          id?: string
          media_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_tags_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      midia_usuarios: {
        Row: {
          created_at: string
          data_envio: string
          id: string
          nome_arquivo: string
          tamanho_bytes: number | null
          tipo_arquivo: string
          updated_at: string
          url_arquivo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_envio?: string
          id?: string
          nome_arquivo: string
          tamanho_bytes?: number | null
          tipo_arquivo: string
          updated_at?: string
          url_arquivo: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_envio?: string
          id?: string
          nome_arquivo?: string
          tamanho_bytes?: number | null
          tipo_arquivo?: string
          updated_at?: string
          url_arquivo?: string
          user_id?: string
        }
        Relationships: []
      }
      participation_media: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          media_type: string
          tryout_name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          media_type: string
          tryout_name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          media_type?: string
          tryout_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participation_media_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participation_media_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      participation_submissions: {
        Row: {
          admin_comment: string | null
          admin_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          local_image_url: string
          peneira_id: string
          peneira_nome_digitada: string | null
          photo_url: string | null
          points_awarded: number | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_comment?: string | null
          admin_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          local_image_url: string
          peneira_id: string
          peneira_nome_digitada?: string | null
          photo_url?: string | null
          points_awarded?: number | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_comment?: string | null
          admin_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          local_image_url?: string
          peneira_id?: string
          peneira_nome_digitada?: string | null
          photo_url?: string | null
          points_awarded?: number | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participation_submissions_peneira_id_fkey"
            columns: ["peneira_id"]
            isOneToOne: false
            referencedRelation: "peneiras"
            referencedColumns: ["id"]
          },
        ]
      }
      peneira_completions: {
        Row: {
          additional_photo_url: string | null
          admin_notes: string | null
          created_at: string
          face_photo_url: string
          id: string
          location_photo_url: string
          points_awarded: number | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_photo_url?: string | null
          admin_notes?: string | null
          created_at?: string
          face_photo_url: string
          id?: string
          location_photo_url: string
          points_awarded?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_photo_url?: string | null
          admin_notes?: string | null
          created_at?: string
          face_photo_url?: string
          id?: string
          location_photo_url?: string
          points_awarded?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      peneiras: {
        Row: {
          age_category: string
          categoria_sub: string | null
          cidade: string | null
          contact: string
          contato_clube: string | null
          created_at: string
          date: string
          end_date: string | null
          endereco_completo: string | null
          estado: string | null
          genero: string
          horario: string | null
          id: string
          image_url: string | null
          instagram_clube: string | null
          is_scheduled: boolean | null
          local_inscricao: string | null
          location: string
          mais_informacoes: string | null
          material_treino: string | null
          modalidade: string
          name: string
          organizer: string
          pdf_url: string | null
          required_docs: string[] | null
          scheduling_link: string | null
          scheduling_phone: string | null
          scheduling_whatsapp: string | null
          taxa: string | null
          updated_at: string
        }
        Insert: {
          age_category: string
          categoria_sub?: string | null
          cidade?: string | null
          contact: string
          contato_clube?: string | null
          created_at?: string
          date: string
          end_date?: string | null
          endereco_completo?: string | null
          estado?: string | null
          genero: string
          horario?: string | null
          id?: string
          image_url?: string | null
          instagram_clube?: string | null
          is_scheduled?: boolean | null
          local_inscricao?: string | null
          location: string
          mais_informacoes?: string | null
          material_treino?: string | null
          modalidade: string
          name: string
          organizer: string
          pdf_url?: string | null
          required_docs?: string[] | null
          scheduling_link?: string | null
          scheduling_phone?: string | null
          scheduling_whatsapp?: string | null
          taxa?: string | null
          updated_at?: string
        }
        Update: {
          age_category?: string
          categoria_sub?: string | null
          cidade?: string | null
          contact?: string
          contato_clube?: string | null
          created_at?: string
          date?: string
          end_date?: string | null
          endereco_completo?: string | null
          estado?: string | null
          genero?: string
          horario?: string | null
          id?: string
          image_url?: string | null
          instagram_clube?: string | null
          is_scheduled?: boolean | null
          local_inscricao?: string | null
          location?: string
          mais_informacoes?: string | null
          material_treino?: string | null
          modalidade?: string
          name?: string
          organizer?: string
          pdf_url?: string | null
          required_docs?: string[] | null
          scheduling_link?: string | null
          scheduling_phone?: string | null
          scheduling_whatsapp?: string | null
          taxa?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          biography: string | null
          city: string | null
          clubs_played: string[] | null
          created_at: string
          date_of_birth: string | null
          email: string
          full_name: string | null
          gender: string | null
          has_seen_onboarding: boolean | null
          height: number | null
          id: string
          instagram: string | null
          is_athlete: boolean | null
          phone_athlete: string | null
          phone_guardian: string | null
          photo_url: string | null
          photos: string[] | null
          position: string | null
          referral_code: string | null
          role: string | null
          seen_intro: boolean | null
          state: string | null
          subscription_tier: string | null
          updated_at: string
          videos: string[] | null
          wants_email_notifications: boolean | null
          weight: number | null
        }
        Insert: {
          age?: number | null
          biography?: string | null
          city?: string | null
          clubs_played?: string[] | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          full_name?: string | null
          gender?: string | null
          has_seen_onboarding?: boolean | null
          height?: number | null
          id: string
          instagram?: string | null
          is_athlete?: boolean | null
          phone_athlete?: string | null
          phone_guardian?: string | null
          photo_url?: string | null
          photos?: string[] | null
          position?: string | null
          referral_code?: string | null
          role?: string | null
          seen_intro?: boolean | null
          state?: string | null
          subscription_tier?: string | null
          updated_at?: string
          videos?: string[] | null
          wants_email_notifications?: boolean | null
          weight?: number | null
        }
        Update: {
          age?: number | null
          biography?: string | null
          city?: string | null
          clubs_played?: string[] | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string | null
          gender?: string | null
          has_seen_onboarding?: boolean | null
          height?: number | null
          id?: string
          instagram?: string | null
          is_athlete?: boolean | null
          phone_athlete?: string | null
          phone_guardian?: string | null
          photo_url?: string | null
          photos?: string[] | null
          position?: string | null
          referral_code?: string | null
          role?: string | null
          seen_intro?: boolean | null
          state?: string | null
          subscription_tier?: string | null
          updated_at?: string
          videos?: string[] | null
          wants_email_notifications?: boolean | null
          weight?: number | null
        }
        Relationships: []
      }
      ranking_resets: {
        Row: {
          created_at: string
          executed_at: string
          id: string
          reset_type: string
        }
        Insert: {
          created_at?: string
          executed_at?: string
          id?: string
          reset_type?: string
        }
        Update: {
          created_at?: string
          executed_at?: string
          id?: string
          reset_type?: string
        }
        Relationships: []
      }
      ranking_submissions: {
        Row: {
          athlete_id: string
          comment: string | null
          created_at: string
          id: string
          img_action_path: string
          img_face_path: string
          peneira_id: string | null
          peneira_name_text: string | null
          status: string
          updated_at: string
        }
        Insert: {
          athlete_id: string
          comment?: string | null
          created_at?: string
          id?: string
          img_action_path: string
          img_face_path: string
          peneira_id?: string | null
          peneira_name_text?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          athlete_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          img_action_path?: string
          img_face_path?: string
          peneira_id?: string | null
          peneira_name_text?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          email_referred: string
          id: string
          referral_code: string
          referred_id: string | null
          referred_reward_given: boolean | null
          referrer_id: string
          referrer_reward_given: boolean | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_referred: string
          id?: string
          referral_code: string
          referred_id?: string | null
          referred_reward_given?: boolean | null
          referrer_id: string
          referrer_reward_given?: boolean | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_referred?: string
          id?: string
          referral_code?: string
          referred_id?: string | null
          referred_reward_given?: boolean | null
          referrer_id?: string
          referrer_reward_given?: boolean | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "public_athlete_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sent_peneiras_submissions: {
        Row: {
          created_at: string
          email_usado: string
          id: string
          nome_clube_digitado: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_usado: string
          id?: string
          nome_clube_digitado: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_usado?: string
          id?: string
          nome_clube_digitado?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      sorteio_pontos: {
        Row: {
          month_year: string
          points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          month_year: string
          points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          month_year?: string
          points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          mensagem: string
          nome: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          mensagem: string
          nome: string
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          mensagem?: string
          nome?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_ranking_points: {
        Row: {
          created_at: string
          id: string
          peneiras_completed: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          peneiras_completed?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          peneiras_completed?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_tags: {
        Row: {
          created_at: string
          id: string
          tag: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tag: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tag?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_athlete_profiles: {
        Row: {
          biography: string | null
          city: string | null
          full_name: string | null
          id: string | null
          instagram: string | null
          is_athlete: boolean | null
          photo_url: string | null
          position: string | null
          state: string | null
        }
        Insert: {
          biography?: string | null
          city?: string | null
          full_name?: string | null
          id?: string | null
          instagram?: string | null
          is_athlete?: boolean | null
          photo_url?: string | null
          position?: string | null
          state?: string | null
        }
        Update: {
          biography?: string | null
          city?: string | null
          full_name?: string | null
          id?: string | null
          instagram?: string | null
          is_athlete?: boolean | null
          photo_url?: string | null
          position?: string | null
          state?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_get_all_midias: {
        Args: Record<PropertyKey, never>
        Returns: {
          data_envio: string
          id: string
          nome_arquivo: string
          tamanho_bytes: number
          tipo_arquivo: string
          url_arquivo: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      approve_email_submission: {
        Args: { p_submission_id: string }
        Returns: undefined
      }
      approve_participation_submission: {
        Args:
          | { admin_comment?: string; submission_id: string }
          | { p_admin_id?: string; p_submission_id: string }
        Returns: undefined
      }
      approve_peneira_submission: {
        Args: { admin_comment?: string; submission_id: string }
        Returns: undefined
      }
      approve_ranking_submission: {
        Args: { submission_id: string }
        Returns: undefined
      }
      approve_submission: {
        Args: { p_submission_id: string }
        Returns: undefined
      }
      cleanup_expired_stories: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_follower_count: {
        Args: { user_id_param: string }
        Returns: number
      }
      get_following_count: {
        Args: { user_id_param: string }
        Returns: number
      }
      get_media_likes_count: {
        Args: { media_id_param: string }
        Returns: number
      }
      get_participation_submissions_for_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          admin_comment: string
          comment: string
          created_at: string
          id: string
          image_url: string
          peneira_id: string
          peneira_name: string
          points_awarded: number
          status: string
          updated_at: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      get_peneira_submissions_for_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          admin_comment: string
          comment: string
          created_at: string
          id: string
          local_image_url: string
          peneira_id: string
          peneira_name: string
          points_awarded: number
          selfie_image_url: string
          status: string
          updated_at: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      get_referrals_for_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          referral_code: string
          referred_email: string
          referred_name: string
          referred_reward_given: boolean
          referrer_email: string
          referrer_name: string
          referrer_reward_given: boolean
          status: string
          updated_at: string
        }[]
      }
      get_user_active_stories: {
        Args: { target_user_id: string }
        Returns: {
          caption: string
          created_at: string
          duration: number
          file_name: string
          file_path: string
          id: string
          mime_type: string
          story_type: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_or_premium: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      realizar_sorteio: {
        Args: { p_month_year: string }
        Returns: {
          cupons: number
          premio: string
          user_id: string
          user_name: string
        }[]
      }
      reject_email_submission: {
        Args: { p_reason?: string; p_submission_id: string }
        Returns: undefined
      }
      reject_participation_submission: {
        Args:
          | { admin_comment?: string; submission_id: string }
          | {
              p_admin_id?: string
              p_rejection_reason?: string
              p_submission_id: string
            }
        Returns: undefined
      }
      reject_peneira_submission: {
        Args: { admin_comment?: string; submission_id: string }
        Returns: undefined
      }
      reset_all_points: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_monthly_ranking: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      search_tryouts: {
        Args: { p_query: string }
        Returns: {
          tryout_name: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "premium" | "user" | "moderator"
      user_role: "free" | "subscriber" | "admin"
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
      app_role: ["admin", "premium", "user", "moderator"],
      user_role: ["free", "subscriber", "admin"],
    },
  },
} as const
