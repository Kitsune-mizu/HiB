'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isError: false,
  });

  useEffect(() => {
    const getSession = async () => {
      try {
        const supabase = createClient();
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        setAuthState({
          user: session?.user || null,
          isLoading: false,
          isError: false,
        });

        // Set up auth state listener for real-time updates
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            setAuthState({
              user: session?.user || null,
              isLoading: false,
              isError: false,
            });
          }
        );

        return () => {
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error('[v0] Auth error:', error);
        setAuthState({
          user: null,
          isLoading: false,
          isError: true,
        });
      }
    };

    getSession();
  }, []);

  return authState;
}
