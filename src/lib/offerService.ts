import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  query,
  orderBy,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Offer } from '../types';

export const OFFERS_COLLECTION = 'offers';

export async function createOffer(offerData: Omit<Offer, 'id' | 'createdAt' | 'clicksCount' | 'viewsCount'>): Promise<string> {
  const newOfferRef = doc(collection(db, OFFERS_COLLECTION));
  const newOffer: Offer = {
    ...offerData,
    id: newOfferRef.id,
    createdAt: Date.now(),
    clicksCount: 0,
    viewsCount: 0,
  };
  await setDoc(newOfferRef, newOffer);
  return newOfferRef.id;
}

export async function updateOffer(id: string, updates: Partial<Offer>) {
  const offerRef = doc(db, OFFERS_COLLECTION, id);
  await updateDoc(offerRef, updates);
}

export async function deleteOffer(id: string) {
  const offerRef = doc(db, OFFERS_COLLECTION, id);
  await deleteDoc(offerRef);
}

export async function incrementOfferViews(id: string) {
  const offerRef = doc(db, OFFERS_COLLECTION, id);
  await updateDoc(offerRef, {
    viewsCount: increment(1)
  });
}

export async function incrementOfferClicks(id: string) {
  const offerRef = doc(db, OFFERS_COLLECTION, id);
  await updateDoc(offerRef, {
    clicksCount: increment(1)
  });
}

export function subscribeToOffers(callback: (offers: Offer[]) => void, onError?: (err: Error) => void) {
  const path = OFFERS_COLLECTION;
  const q = query(collection(db, OFFERS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const offers = snapshot.docs.map(doc => doc.data() as Offer);
    callback(offers);
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
}

export function subscribeToActiveOffers(callback: (offers: Offer[]) => void, onError?: (err: Error) => void) {
  const path = OFFERS_COLLECTION;
  const q = query(
    collection(db, OFFERS_COLLECTION),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const offers = snapshot.docs.map(doc => doc.data() as Offer);
    callback(offers);
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
}
