import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { BlogPost, BlogPostInput, seedPosts } from 'shared';

const dotenv = require('dotenv');
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const USE_SUPABASE = SUPABASE_URL && SUPABASE_KEY;

let supabase: SupabaseClient | null = null;
const LOCAL_DB_PATH = path.join(__dirname, '../posts.json');

// Load local database
function getLocalPosts(): BlogPost[] {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(seedPosts, null, 2));
      return seedPosts;
    }
    const data = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading local db file, returning fallback:', error);
    return seedPosts;
  }
}

// Save local database
function saveLocalPosts(posts: BlogPost[]): void {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(posts, null, 2));
  } catch (error) {
    console.error('Error writing to local db file:', error);
  }
}

if (USE_SUPABASE) {
  console.log('Using Supabase DB for blog posts.');
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  console.log(`Using Local JSON file DB at ${LOCAL_DB_PATH} (Supabase environment variables missing).`);
  getLocalPosts(); // Initialize if not present
}

export async function getPosts(): Promise<BlogPost[]> {
  if (USE_SUPABASE && supabase) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error, falling back to local posts:', error);
      return getLocalPosts().sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    return data as BlogPost[];
  }
  
  return getLocalPosts().sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (USE_SUPABASE && supabase) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      console.error(`Supabase error fetching post ${slug}:`, error);
      const posts = getLocalPosts();
      return posts.find(p => p.slug === slug) || null;
    }
    return data as BlogPost;
  }

  const posts = getLocalPosts();
  return posts.find(p => p.slug === slug) || null;
}

export async function createPost(input: BlogPostInput): Promise<BlogPost> {
  const newPost: BlogPost = {
    id: USE_SUPABASE ? undefined as any : Math.random().toString(36).substring(2, 9),
    ...input,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (USE_SUPABASE && supabase) {
    const { data, error } = await supabase
      .from('posts')
      .insert([input])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error inserting post:', error);
      throw error;
    }
    return data as BlogPost;
  }

  const posts = getLocalPosts();
  posts.push(newPost);
  saveLocalPosts(posts);
  return newPost;
}

export async function updatePost(id: string, input: Partial<BlogPostInput>): Promise<BlogPost> {
  const updated_at = new Date().toISOString();

  if (USE_SUPABASE && supabase) {
    const { data, error } = await supabase
      .from('posts')
      .update({ ...input, updated_at })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error updating post:', error);
      throw error;
    }
    return data as BlogPost;
  }

  const posts = getLocalPosts();
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error('Post not found');
  }
  posts[index] = {
    ...posts[index],
    ...input,
    updated_at
  };
  saveLocalPosts(posts);
  return posts[index];
}

export async function deletePost(id: string): Promise<boolean> {
  if (USE_SUPABASE && supabase) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase error deleting post:', error);
      throw error;
    }
    return true;
  }

  const posts = getLocalPosts();
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) {
    return false;
  }
  posts.splice(index, 1);
  saveLocalPosts(posts);
  return true;
}
