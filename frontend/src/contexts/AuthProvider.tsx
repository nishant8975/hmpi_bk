// src/contexts/AuthProvider.tsx
import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { supabase } from '../config/supabaseClient'; // Make sure this path is correct
import { Session, User } from '@supabase/supabase-js';

// Define the shape of your user profile data
interface Profile {
  id: string;
  full_name: string;
  role: 'admin' | 'policymaker' | 'researcher' | 'public';
}

// Define what the context will provide
interface AuthContextType {
  session: Session | null;
  user: User | null;

  profile: Profile | null;
  loading: boolean;
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This function runs once to get the initial session and profile
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      // If a user is logged in, fetch their profile
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);
      }
      setLoading(false);
    };

    getInitialSession();

    // This listener reacts to auth changes (login, logout)
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
         const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);
      } else {
        setProfile(null); // Clear profile on logout
      }
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return () => listener?.subscription.unsubscribe();
  }, []);

  const value = { session, user, profile, loading };

  // Don't render the rest of the app until the initial auth check is complete
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};