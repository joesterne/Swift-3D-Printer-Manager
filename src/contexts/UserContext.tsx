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
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Use services for profile management
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

        // Real-time listener
        const unsubProfile = userService.subscribeToProfile(firebaseUser.uid, (data) => {
          setProfile(data);
        });

        setLoading(false);
        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
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
