import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from 'react';
import { supabase } from '../config/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

// --- Type Definitions ---
export type UserRole = 'admin' | 'policymaker' | 'researcher' | 'public';
export interface Profile { id: string; full_name: string; role: UserRole; }
export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  role: UserRole | null;
  userId: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FullPageSpinner = () => (
  <div className="flex justify-center items-center h-screen w-screen bg-background">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        // --- Step 1: Get the initial session immediately ---
        // This gives us a reliable answer on the first render.
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (isMounted) {
          setSession(initialSession);
          const currentUser = initialSession?.user ?? null;
          if (currentUser) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();
            if (profileError) throw profileError;
            if (isMounted) setProfile(profileData);
          }
        }
      } catch (error) {
        console.error("Error during initial auth check:", error);
        if (isMounted) {
          setSession(null);
          setProfile(null);
        }
      } finally {
        // This is crucial: set loading to false after the initial check is complete.
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    initializeAuth();

    // --- Step 2: Set up the listener for future changes (login/logout) ---
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        // The initial load is handled above. This listener only handles *changes*.
        if (isMounted) {
          setSession(newSession);
          setProfile(null); // Clear profile, it will be refetched if a user exists
          if (newSession?.user) {
             // Re-fetch profile on user change
             supabase.from('profiles').select('*').eq('id', newSession.user.id).single().then(({ data }) => {
               if(isMounted) setProfile(data);
             });
          }
          // We don't need to manage loading state here anymore.
        }
      }
    );

    // This cleanup function is essential for Strict Mode
    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value = { session, user: session?.user ?? null, profile, loading, role: profile?.role ?? null, userId: session?.user?.id ?? null };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <FullPageSpinner /> : children}
    </AuthContext.Provider>
  );
};

