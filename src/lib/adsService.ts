import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Ad } from '../types';

export const subscribeToAds = (onUpdate: (ads: Ad[]) => void, onError: (error: Error) => void) => {
  const path = 'ads';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const fetchedAds = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Ad[];
    onUpdate(fetchedAds);
  }, (error) => {
    if (onError) {
      onError(new Error(JSON.stringify({
        error: error.message,
        operationType: OperationType.GET,
        path
      })));
    } else {
      handleFirestoreError(error, OperationType.GET, path);
    }
  });
};

export const createAd = async (ad: Omit<Ad, 'id' | 'createdAt'>) => {
  const path = 'ads';
  try {
    const newRef = doc(collection(db, path));
    const newAd: Ad = {
      ...ad,
      id: newRef.id,
      createdAt: Date.now()
    };
    await setDoc(newRef, newAd);
    return newAd;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateAd = async (id: string, updates: Partial<Ad>) => {
  const path = `ads/${id}`;
  try {
    const adRef = doc(db, 'ads', id);
    await updateDoc(adRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteAd = async (id: string) => {
  const path = `ads/${id}`;
  try {
    const adRef = doc(db, 'ads', id);
    await deleteDoc(adRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

