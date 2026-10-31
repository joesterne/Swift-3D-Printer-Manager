import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../types';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

interface UserContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The profile unsubscribe used to be RETURNED from the async auth
    // callback — Firebase discards that return value, so the listener was
    // never torn down: one leaked listener per login, and a previous user's
    // profile writes could land after logout or an account switch. It now
    // lives in this closure and is called before each new subscription and
    // from the effect cleanup.
    let unsubProfile: (() => void) | null = null;

    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      unsubProfile?.();
      unsubProfile = null;
      setUser(firebaseUser);

      // try/finally: a failed profile read used to propagate out of this
      // callback before setLoading(false), stranding the app on the
      // "Initializing Labs..." spinner forever.
      try {
        if (firebaseUser) {
          const existingProfile = await userService.getUserProfile(firebaseUser.uid);

          if (!existingProfile) {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
              createdAt: new Date().toISOString()
            };
            await userService.createUserProfile(newProfile);
            setProfile(newProfile);
          } else {
            setProfile(existingProfile);
          }

          unsubProfile = userService.subscribeToProfile(firebaseUser.uid, (data) => {
            setProfile(data);
          });
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Failed to initialize user profile:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      unsubProfile?.();
    };
  }, []);

  const login = async () => {
    await authService.login();
  };

  const logout = async () => {
    await authService.logout();
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    await userService.updateUserProfile(user.uid, data);
  };

  return (
    <UserContext.Provider value={{ user, profile, loading, login, logout, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
