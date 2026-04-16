import { toast } from 'sonner';
import { auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, customMessage?: string) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  
  // User-friendly message
  let message = customMessage || "An unexpected database error occurred.";
  if (errInfo.error.includes("permission-denied")) {
    message = "You don't have permission to perform this action. Please ensure you are logged in.";
  } else if (errInfo.error.includes("quota-exceeded")) {
    message = "Database quota exceeded. Please try again later.";
  }

  toast.error(message);
  throw new Error(JSON.stringify(errInfo));
}

export function handleAuthError(error: unknown) {
  console.error('Auth Error: ', error);
  const err = error as any;
  let message = "Authentication failed.";

  if (err.code === 'auth/popup-closed-by-user') {
    message = "Login cancelled. Please keep the popup open to sign in.";
  } else if (err.code === 'auth/network-request-failed') {
    message = "Network error. Please check your connection.";
  } else if (err.code === 'auth/user-disabled') {
    message = "This account has been disabled.";
  } else if (err.code === 'auth/operation-not-allowed') {
    message = "Google sign-in is not enabled. Please contact support.";
  } else if (err.message?.includes('unauthorized-domain')) {
    message = "This domain is not authorized for Firebase Auth. Please check your Firebase console.";
  }

  toast.error(message);
}

export function handleAIError(error: unknown) {
  console.error('AI Error: ', error);
  const message = error instanceof Error ? error.message : "AI assistant is currently unavailable.";
  toast.error(`AI Error: ${message}`);
}
