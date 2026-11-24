import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import cfg from '../firebase-applet-config.json';
import { MOCK_POSTS } from '../src/data/mockData';

async function main() {
  console.log('[Seed] Connecting to Firestore:', cfg.projectId, cfg.firestoreDatabaseId);
  const app = initializeApp(cfg);
  const db = getFirestore(app, cfg.firestoreDatabaseId);
  const articlesCol = collection(db, 'articles');

  // 1. Fetch existing articles
  const snap = await getDocs(articlesCol);
  console.log(`[Seed] Found ${snap.size} existing articles in Firestore.`);

  // List of IDs in MOCK_POSTS
  const validIds = new Set(MOCK_POSTS.map(p => p.id));

  // Clean up old obsolete / duplicate articles that are not in MOCK_POSTS
  for (const d of snap.docs) {
    if (!validIds.has(d.id)) {
      console.log(`[Seed] Removing obsolete article: "${d.id}"`);
      await deleteDoc(d.ref);
    }
  }

  // 2. Insert or update all 24 high-quality articles
  console.log(`[Seed] Uploading ${MOCK_POSTS.length} comprehensive articles to Firestore...`);
  for (const post of MOCK_POSTS) {
    const postRef = doc(db, 'articles', post.id);
    await setDoc(postRef, {
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
      likesCount: post.likesCount || 0,
      viewsCount: post.viewsCount || 0,
      commentsCount: post.commentsCount || 0,
      isDraft: false
    });
    console.log(`[Seed] Stored: "${post.id}" (${post.categoryId}) - ${post.title}`);
  }

  // 3. Verify final state
  const verifySnap = await getDocs(articlesCol);
  console.log(`\n[Seed] SUCCESS! Total articles in Firestore now: ${verifySnap.size}`);
  let idx = 1;
  verifySnap.forEach((d) => {
    const data = d.data();
    console.log(` ${idx++}. [${data.categoryId}] ${data.title} (${data.readTime} min read, ${data.content?.length || 0} sections)`);
  });

  process.exit(0);
}

main().catch(err => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
