import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  getFirestore,
  persistentLocalCache, 
  persistentMultipleTabManager, 
  doc, 
  getDocFromServer,
  collection,
  addDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore with robust local persistent cache for seamless offline resilience
let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, firebaseConfig.firestoreDatabaseId);
} catch (cacheError) {
  console.warn('[Firebase Cache Initialization]: Could not mount multi-tab persistent cache. Reverting to basic schema.', cacheError);
  try {
    dbInstance = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);
  } catch (fallbackError) {
    // If double initialized, fallback to standard getFirestore getter
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
}

export const db = dbInstance;

// Initialize Firebase Auth
export const auth = getAuth();

// Standardized operation types as requested in the Firebase Integration Skill
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
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

/**
 * Standardized Firebase Firestore error handler to throw context-rich error objects.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  console.error('[Firestore Error Interceptor]:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function logSystemError(message: string, context?: any) {
  try {
    const errorLogRef = collection(db, 'system_errors');
    await addDoc(errorLogRef, {
      message: String(message),
      context: typeof context === 'string' ? context : JSON.stringify(context || {}),
      timestamp: new Date().toISOString(),
      userId: auth.currentUser?.uid || 'anonymous'
    });
  } catch (err) {
    console.error('Failed to log system error to centralized console', err);
  }
}
async function testConnection() {
  try {
    // Testing path
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Firebase Setup]: Connected to Firestore backend cloud servers successfully.');
  } catch (error: any) {
    const isOffline = error && error.message && (
      error.message.includes('offline') || 
      error.message.includes('reach') || 
      error.message.includes('unavailable') ||
      error.message.includes('Connection failed')
    );
    if (isOffline) {
      console.log('[Firebase Setup]: Running in robust Offline-first cached database mode safely.');
    } else {
      console.warn('[Firebase Connection Warning]: Unresolved status:', error);
    }
  }
}

// Call connectivity test at boot
testConnection();
