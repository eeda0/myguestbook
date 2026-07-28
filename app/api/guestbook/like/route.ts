import { NextResponse } from 'next/server';
import { updatePostLikes } from '../../../../lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, delta } = body;
    if (typeof id !== 'number' || typeof delta !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const updated = await updatePostLikes(id, delta);
    return NextResponse.json(updated, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error)?.message ?? '서버 오류' }, { status: 500 });
  }
}
