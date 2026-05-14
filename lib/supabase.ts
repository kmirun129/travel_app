import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type Todo = {
  id: number;
  text: string;
  done: boolean;
  created_at: string;
};

type Database = {
  public: {
    Tables: {
      todos: {
        Row: Todo;
        Insert: { text: string; done?: boolean };
        Update: { text?: string; done?: boolean };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let _client: SupabaseClient<Database> | null = null;

export function getClient(): SupabaseClient<Database> {
  if (!_client) {
    _client = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
}
