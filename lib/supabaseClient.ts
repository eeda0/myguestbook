import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local.');
}

export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

export type Post = {
  id: number;
  name: string;
  message: string;
  created_at: string;
  likes?: number;
};

export async function getPosts() {
  const { data, error } = await supabaseAdmin
    .from<Post>('posts')
    .select('id, name, message, created_at, likes')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createPost({ name, message }: { name: string; message: string }) {
  const { data, error } = await supabaseAdmin
    .from<Post>('posts')
    .insert({ name, message })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updatePostLikes(id: number, delta: number) {
  // fetch current likes
  const { data: rows, error: selErr } = await supabaseAdmin.from<Post>('posts').select('likes').eq('id', id).limit(1).single();
  if (selErr) throw selErr;
  const current = (rows as any)?.likes ?? 0;
  const next = Math.max(0, current + delta);

  const { data, error } = await supabaseAdmin
    .from<Post>('posts')
    .update({ likes: next })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updatePost(id: number, { name, message }: { name?: string; message?: string }) {
  const payload: { name?: string; message?: string } = {};
  if (name !== undefined) payload.name = name;
  if (message !== undefined) payload.message = message;

  const { data, error } = await supabaseAdmin
    .from<Post>('posts')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deletePost(id: number) {
  const { error } = await supabaseAdmin
    .from<Post>('posts')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  return true;
}
