import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Ad } from '../types';

export const subscribeToAds = (onUpdate: (ads: Ad[]) => void, onError: (error: Error) => void) => {
  const q = query(collection(db, 'ads'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const fetchedAds = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Ad[];
    onUpdate(fetchedAds);
  }, onError);
};

export const createAd = async (ad: Omit<Ad, 'id' | 'createdAt'>) => {
  const newRef = doc(collection(db, 'ads'));
  const newAd: Ad = {
    ...ad,
    id: newRef.id,
    createdAt: Date.now()
  };
  await setDoc(newRef, newAd);
  return newAd;
};

export const updateAd = async (id: string, updates: Partial<Ad>) => {
  const adRef = doc(db, 'ads', id);
  await updateDoc(adRef, updates);
};

export const deleteAd = async (id: string) => {
  const adRef = doc(db, 'ads', id);
  await deleteDoc(adRef);
};
