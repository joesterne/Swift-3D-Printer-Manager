import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../lib/error-handling';
import { toast } from 'sonner';

export const userService = {
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    const userDocRef = doc(db, 'users', uid);
    try {
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'users');
      return null;
    }
  },

  createUserProfile: async (profile: UserProfile): Promise<void> => {
    const userDocRef = doc(db, 'users', profile.uid);
    try {
      await setDoc(userDocRef, profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users');
      throw error;
    }
  },

  updateUserProfile: async (uid: string, data: Partial<UserProfile>): Promise<void> => {
    const userDocRef = doc(db, 'users', uid);
    try {
      await setDoc(userDocRef, data, { merge: true });
      toast.success("Profile updated!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users');
      throw error;
    }
  },

  subscribeToProfile: (uid: string, callback: (profile: UserProfile) => void) => {
    const userDocRef = doc(db, 'users', uid);
    return onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as UserProfile);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
    });
  }
};
