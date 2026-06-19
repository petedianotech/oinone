import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { PromoCampaign } from '../types';

export const PROMO_COLLECTION = 'promo_campaigns';

export const DEFAULT_PROMOS: Record<PromoCampaign['id'], PromoCampaign> = {
  article_inline_banner: {
    id: 'article_inline_banner',
    label: 'Premium Sponsored Airdrop',
    title: 'Unlock Complete Online Wealth & MMO Master Protocols',
    description: 'Partner Resource: Instant direct rewards, verified monetization networks & premium business systems.',
    linkUrl: 'https://omg10.com/4/11136040',
    btnText: 'Access Premium Offer',
    status: 'active'
  },
  article_sidebar_block: {
    id: 'article_sidebar_block',
    label: 'SPONSOR LINK',
    title: 'Claim $1,500 Daily CPA Bonus AirDrop & Resources',
    description: 'Access premium business systems, verified direct payment assets, and monetized passive campaigns instantly.',
    linkUrl: 'https://omg10.com/4/11136040',
    btnText: 'TAP TO SECURE',
    status: 'active'
  },
  navbar_sidebar_widget: {
    id: 'navbar_sidebar_widget',
    label: 'PARTNER AIRDROP',
    title: 'Claim $1,500 Reward & MMO Toolkits',
    description: 'Access verified direct-payment systems, complete monetization courses and premium digital toolsets now.',
    linkUrl: 'https://omg10.com/4/11136040',
    btnText: 'ACTIVATE PROTOCOL',
    status: 'active'
  },
  home_grid_ad_card: {
    id: 'home_grid_ad_card',
    label: 'SPONSOR AD',
    title: 'Digital Wealth Activation',
    description: 'Securing direct high-payout income engines, verified advertising portals, and fast tracking MMORPG resources.',
    linkUrl: 'https://omg10.com/4/11136040',
    btnText: 'Access Partner Vault',
    status: 'active'
  }
};

/**
 * Real-time subscription to promo campaigns. Handles fallback seeding if database is empty.
 */
export function subscribeToPromos(callback: (promos: Record<PromoCampaign['id'], PromoCampaign>) => void, onError?: (err: Error) => void) {
  const path = PROMO_COLLECTION;
  const colRef = collection(db, PROMO_COLLECTION);
  
  return onSnapshot(colRef, async (snapshot) => {
    const fetched: Partial<Record<PromoCampaign['id'], PromoCampaign>> = {};
    
    snapshot.forEach((doc) => {
      const data = doc.data() as PromoCampaign;
      fetched[doc.id as PromoCampaign['id']] = data;
    });

    // Merge fetched promos with defaults so any missing ones automatically fallback to their hardcoded values
    const merged: Record<PromoCampaign['id'], PromoCampaign> = {
      article_inline_banner: { ...DEFAULT_PROMOS.article_inline_banner, ...fetched.article_inline_banner },
      article_sidebar_block: { ...DEFAULT_PROMOS.article_sidebar_block, ...fetched.article_sidebar_block },
      navbar_sidebar_widget: { ...DEFAULT_PROMOS.navbar_sidebar_widget, ...fetched.navbar_sidebar_widget },
      home_grid_ad_card: { ...DEFAULT_PROMOS.home_grid_ad_card, ...fetched.home_grid_ad_card },
    };

    callback(merged);
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

/**
 * Updates a single promo campaign in Firestore.
 */
export async function updatePromoCampaign(id: PromoCampaign['id'], updates: Partial<PromoCampaign>) {
  const path = `${PROMO_COLLECTION}/${id}`;
  try {
    const docRef = doc(db, PROMO_COLLECTION, id);
    const campaignToSave: PromoCampaign = {
      ...DEFAULT_PROMOS[id],
      ...updates,
      id,
      updatedAt: Date.now()
    };
    await setDoc(docRef, campaignToSave, { merge: true });
    return campaignToSave;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
