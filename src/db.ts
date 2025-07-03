import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const DB_PATH = path.join(process.cwd(), 'data', 'database.sqlite');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      permalink TEXT UNIQUE NOT NULL,
      bio TEXT
    );
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      permalink TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      publish_date TEXT NOT NULL,
      preview INTEGER DEFAULT 1,
      FOREIGN KEY(profile_id) REFERENCES profiles(id),
      UNIQUE(profile_id, permalink)
    );
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      author TEXT,
      content TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(post_id) REFERENCES posts(id)
    );
  `);
}

initDatabase();

function seedFromContent() {
  const profileCount = db.prepare('SELECT COUNT(*) as count FROM profiles').get().count;
  if (profileCount > 0) return;

  const profilesDir = path.join(process.cwd(), 'src', 'content', 'profiles');
  const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');

  const insertProfile = db.prepare('INSERT INTO profiles (name, permalink, bio) VALUES (?, ?, ?)');
  const insertPost = db.prepare('INSERT INTO posts (profile_id, permalink, title, content, publish_date, preview) VALUES (?, ?, ?, ?, ?, ?)');

  const profileFiles = fs.readdirSync(profilesDir).filter(f => f.endsWith('.md'));
  const profilesMap: Record<string, number> = {};

  for (const file of profileFiles) {
    const fullPath = path.join(profilesDir, file);
    const { data } = matter(fs.readFileSync(fullPath, 'utf8'));
    const info = insertProfile.run(data.name || data.title, data.permalink, data.bio || '');
    profilesMap[data.permalink] = info.lastInsertRowid as number;
  }

  const profileDirs = fs.readdirSync(postsDir);
  for (const dir of profileDirs) {
    const fullDir = path.join(postsDir, dir);
    if (!fs.statSync(fullDir).isDirectory()) continue;
    const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.md'));
    for (const f of files) {
      const p = path.join(fullDir, f);
      const { data, content } = matter(fs.readFileSync(p, 'utf8'));
      const profileId = profilesMap[data.profile];
      if (!profileId) continue;
      const dateStr = (data.publishDate instanceof Date ? data.publishDate.toISOString() : data.publishDate);
      insertPost.run(profileId, data.permalink, data.title, content.trim(), dateStr, data.preview === false ? 0 : 1);
    }
  }
}

seedFromContent();

export function getAllProfiles() {
  return db.prepare('SELECT * FROM profiles ORDER BY name').all();
}

export function getProfile(permalink: string) {
  return db.prepare('SELECT * FROM profiles WHERE permalink = ?').get(permalink);
}

export function getAllPosts() {
  return db.prepare(`
    SELECT posts.*, profiles.permalink as profilePermalink, profiles.name as profileName
    FROM posts JOIN profiles ON posts.profile_id = profiles.id
    ORDER BY datetime(publish_date) DESC
  `).all();
}

export function getPostsByProfile(permalink: string) {
  return db.prepare(`
    SELECT posts.*, profiles.permalink as profilePermalink, profiles.name as profileName
    FROM posts JOIN profiles ON posts.profile_id = profiles.id
    WHERE profiles.permalink = ?
    ORDER BY datetime(publish_date) DESC
  `).all(permalink);
}

export function getPost(profilePermalink: string, postPermalink: string) {
  return db.prepare(`
    SELECT posts.*, profiles.permalink as profilePermalink, profiles.name as profileName
    FROM posts JOIN profiles ON posts.profile_id = profiles.id
    WHERE profiles.permalink = ? AND posts.permalink = ?
  `).get(profilePermalink, postPermalink);
}

export function getComments(profilePermalink: string, postPermalink: string) {
  return db.prepare(`
    SELECT c.* FROM comments c
    JOIN posts p ON c.post_id = p.id
    JOIN profiles prof ON p.profile_id = prof.id
    WHERE prof.permalink = ? AND p.permalink = ?
    ORDER BY datetime(c.created_at) ASC
  `).all(profilePermalink, postPermalink);
}

export default db;
