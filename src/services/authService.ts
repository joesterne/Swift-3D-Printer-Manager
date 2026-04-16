import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { handleAuthError } from '../lib/error-handling';
import { toast } from 'sonner';

export const authService = {
  login: async (): Promise<void> => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Successfully logged in!");
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
      toast.success("Logged out");
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  },

  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};
