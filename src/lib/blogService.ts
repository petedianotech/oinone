import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  writeBatch,
  increment,
  updateDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Post, CategoryId } from '../types';
import { MOCK_POSTS } from '../data/mockData';

// Generate or retrieve visitor ID for reaction tracking
const getVisitorId = (): string => {
  let id = localStorage.getItem('oinone_visitor_id');
  if (!id) {
    id = 'visitor_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('oinone_visitor_id', id);
  }
  return id;
};

export const VISITOR_ID = getVisitorId();

export interface CommentData {
  id: string;
  postId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

/**
 * Ensures that Mock Data is uploaded onto the Firestore collections on First Visit/Run.
 */
export async function seedPostsIfEmpty(): Promise<Post[]> {
  const path = 'articles';
  try {
    const q = collection(db, path);
    const snap = await getDocs(q);
    
    if (snap.empty) {
      console.log('[Firestore Seeding]: No articles found. Seeding default high-resolution posts...');
      const batch = writeBatch(db);
      
      for (const post of MOCK_POSTS) {
        const docRef = doc(db, 'articles', post.id);
        // Map fields explicitly corresponding to the validator schema
        batch.set(docRef, {
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          categoryId: post.categoryId,
          author: {
            id: post.author.id,
            name: post.author.name,
            avatar: post.author.avatar,
            role: post.author.role
          },
          date: post.date,
          readTime: Number(post.readTime),
          imageUrl: post.imageUrl,
          featured: !!post.featured,
          trending: !!post.trending,
          likesCount: 0
        });
      }
      
      await batch.commit();
      console.log('[Firestore Seeding]: Successfully seeded default set.');
      return MOCK_POSTS;
    } else {
      const posts: Post[] = [];
      snap.forEach((doc) => {
        posts.push(doc.data() as Post);
      });
      return posts;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Fetches all blog articles in real-time or via onSnapshot listener.
 */
export function subscribeToArticles(callback: (posts: Post[]) => void, onError: (err: Error) => void) {
  const path = 'articles';
  const q = collection(db, path);
  
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      // Lazy seed on snapshot empty
      seedPostsIfEmpty().then((seeded) => {
        callback(seeded);
      }).catch((err) => {
        onError(err);
      });
    } else {
      const posts: Post[] = [];
      snapshot.forEach((doc) => {
        posts.push(doc.data() as Post);
      });
      callback(posts);
    }
  }, (error) => {
    onError(new Error(JSON.stringify({
      error: error.message,
      operationType: OperationType.GET,
      path
    })));
  });
}

/**
 * Register a user as a newsletter subscriber.
 */
export async function subscribeNewsletter(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const path = `subscribers/${normalizedEmail}`;
  try {
    const subscriberRef = doc(db, 'subscribers', normalizedEmail);
    await setDoc(subscriberRef, {
      email: normalizedEmail,
      subscribedAt: new Date().toISOString(),
      status: 'active'
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Loads interactive comments for a post in real-time.
 */
export function subscribeToComments(postId: string, callback: (comments: CommentData[]) => void, onError: (err: Error) => void) {
  const path = `articles/${postId}/comments`;
  const commentsCol = collection(db, 'articles', postId, 'comments');
  
  return onSnapshot(commentsCol, (snapshot) => {
    const comments: CommentData[] = [];
    snapshot.forEach((doc) => {
      comments.push(doc.data() as CommentData);
    });
    // Sort reviews chronologically by date
    comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(comments);
  }, (error) => {
    onError(new Error(JSON.stringify({
      error: error.message,
      operationType: OperationType.GET,
      path
    })));
  });
}

/**
 * Submits reader comments onto a post.
 */
export async function addPostComment(postId: string, authorName: string, content: string): Promise<CommentData> {
  const commentId = 'comment_' + Math.random().toString(36).substring(2, 11) + Date.now().toString();
  const path = `articles/${postId}/comments/${commentId}`;
  
  const commentPayload: CommentData = {
    id: commentId,
    postId,
    authorName: authorName.trim() || 'Anonymous Reader',
    authorAvatar: 'https://i.ibb.co/cXpLmLVC/20260516-210805.jpg', // Standard portrait accent or simple avatar
    content: content.trim(),
    createdAt: new Date().toISOString()
  };

  try {
    const commentRef = doc(db, 'articles', postId, 'comments', commentId);
    await setDoc(commentRef, commentPayload);
    return commentPayload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Toggle like for a post (unique to visitor ID)
 * This maintains consistent likes counts and updates post metadata.
 */
export async function togglePostLike(postId: string): Promise<{ liked: boolean, count: number }> {
  const likeId = VISITOR_ID;
  const pathLike = `articles/${postId}/likes/${likeId}`;
  const pathBase = `articles/${postId}`;
  
  try {
    const likeRef = doc(db, 'articles', postId, 'likes', likeId);
    const likeDoc = await getDoc(likeRef);
    const postRef = doc(db, 'articles', postId);
    
    let isLiked = false;
    
    if (likeDoc.exists()) {
      // Already liked, so remove it (dislike)
      await setDoc(likeRef, {
        id: likeId,
        postId,
        userId: VISITOR_ID,
        likesCount: 0
      });
      // Decrement main likesCount securely
      await updateDoc(postRef, {
        likesCount: increment(-1)
      });
      isLiked = false;
    } else {
      // Put new like record
      await setDoc(likeRef, {
        id: likeId,
        postId,
        userId: VISITOR_ID,
        likesCount: 1
      });
      // Increment main likesCount
      await updateDoc(postRef, {
        likesCount: increment(1)
      });
      isLiked = true;
    }
    
    // Fetch updated likesCount
    const postSnap = await getDoc(postRef);
    const updatedCount = postSnap.data()?.likesCount || 0;
    
    return { liked: isLiked, count: updatedCount };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, pathLike);
  }
}

/**
 * Gets like status of post for this visitor
 */
export async function getPostLikeStatus(postId: string): Promise<boolean> {
  try {
    const likeRef = doc(db, 'articles', postId, 'likes', VISITOR_ID);
    const snap = await getDoc(likeRef);
    return snap.exists() && snap.data()?.likesCount === 1;
  } catch (e) {
    return false;
  }
}
