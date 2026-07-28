import { NextResponse } from 'next/server';
import { createPost } from '../../../lib/supabaseClient';
import { getPosts } from '../../../lib/supabaseClient';

export async function POST(request: Request) {
  const body = await request.json();
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const message = typeof body?.message === 'string' ? body.message.trim() : '';

  if (!name || !message) {
    return NextResponse.json({ error: '이름과 메시지를 모두 입력해주세요.' }, { status: 400 });
  }

  try {
    const data = await createPost({ name, message });
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error)?.message ?? '서버 오류' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const data = await getPosts();
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error)?.message ?? '서버 오류' }, { status: 500 });
  }
}
