'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const supabase = createClient();
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            // Session changed, components will react to this
            if (event === 'SIGNED_OUT') {
              // Clear any stored data on sign out
              localStorage.removeItem('user-profile');
            }
          }
        );

        setIsInitialized(true);

        return () => {
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error('[v0] Session initialization error:', error);
        setIsInitialized(true);
      }
    };

    initializeSession();
  }, []);

  // Don't render children until session is initialized to prevent hydration mismatch
  if (!isInitialized) {
    return null;
  }

  return <>{children}</>;
}
