import { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../config/supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  role: 'admin' | 'policymaker' | 'researcher' | 'public';
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean; // This is our single source of truth
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const initAuth = async () => {
      try {
        // ✅ Get current active session on first load
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const currentSession = data?.session ?? null;
        const currentUser = currentSession?.user ?? null;

        if (!ignore) {
          setSession(currentSession);
          setUser(currentUser);
        }

        // ✅ Fetch profile only if user exists
        if (currentUser) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          if (profileError) throw profileError;
          if (!ignore) setProfile(profileData);
        }
      } catch (error) {
        console.error('Initial Auth Load Error:', error);
        if (!ignore) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    initAuth();

    // ✅ Listen for future auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) throw profileError;
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Auth State Change Error:', error);
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      ignore = true;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const value = { session, user, profile, loading };

  // ✅ While checking auth, show full-page spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // ✅ Once loading is done, render app with auth context
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
