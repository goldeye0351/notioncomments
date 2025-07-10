import { createComment, getCommentsByPostId } from '@/lib/notion';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: '缺少必要的 postId 参数' },
        { status: 400 }
      );
    }

    const comments = await getCommentsByPostId(postId);
    return NextResponse.json(comments);
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json(
      { error: '获取评论失败，请稍后重试' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { postId: string; content: string; author: string; parentId?: string};
    const { postId, content, author, parentId } = body;

    if (!postId || !content || !author) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 获取客户端 IP
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';

    const comment = await createComment({
      postId,
      content,
      author,
      parentId,
      ipAddress: ip // 添加 IP 地址
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}