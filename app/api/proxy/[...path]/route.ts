import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const API_URL = process.env.NEST_API_URL ?? 'http://localhost:3004';

async function relay(req: NextRequest, path: string[]) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ message: 'Non authentifie' }, { status: 401 });
  }
  if (session.error === 'RefreshAccessTokenError') {
    return NextResponse.json({ message: 'Session expiree' }, { status: 401 });
  }

  const target = `${API_URL}/${path.join('/')}${req.nextUrl.search}`;
  const body =
    req.method === 'GET' || req.method === 'DELETE'
      ? undefined
      : await req.text();

  const upstream = await fetch(target, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.accessToken}`,
    },
    body,
    cache: 'no-store',
  });

  if (upstream.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  return relay(req, (await ctx.params).path);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  return relay(req, (await ctx.params).path);
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  return relay(req, (await ctx.params).path);
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  return relay(req, (await ctx.params).path);
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  return relay(req, (await ctx.params).path);
}
