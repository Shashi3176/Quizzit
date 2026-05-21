import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '../../auth/verifyToken/route';

async function checkAuthorization(req: NextRequest, roomId: number) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return NextResponse.json({ message: 'Unauthorized - No token' }, { status: 401 });
  const verificationResult = await verifyToken(req);
  if (!verificationResult.ok) return NextResponse.json({ message: 'Unauthorized - Invalid token' }, { status: 401 });
  const data = await verificationResult.json();
  const userId = data.data.decoded.userId;
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const room = await prisma.guessItRoom.findUnique({
    where: { id: roomId },
    select: { hostId: true, moderators: { select: { id: true } }, participants: { select: { userId: true, name: true } } },
  });
  if (!room) return NextResponse.json({ message: 'Room not found' }, { status: 404 });
  const userIdNum = Number(userId);
  const isHost = Number(room.hostId) === userIdNum;
  const isMod = room.moderators.some(m => Number(m.id) === userIdNum);
  const isPart = room.participants.some(p => String(p.userId) === String(userId));
  if (isHost || isMod || isPart) return null;
  return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
  const authError = await checkAuthorization(req, id);
  if (authError) return authError;
  try {
    const room = await prisma.guessItRoom.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: 'asc' }, include: { acceptableAnswers: true } }, moderators: true, participants: true },
    });
    if (!room) return NextResponse.json({ message: 'Room not found' }, { status: 404 });
    const { user_password: _up, mod_password: _mp, ...details } = room;
    return NextResponse.json(details, { status: 200 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
  const authError = await checkAuthorization(req, id);
  if (authError) return authError;
  try {
    const { title, desc, user_password, mod_password, moderators } = await req.json();
    const updated = await prisma.guessItRoom.update({
      where: { id },
      data: { title, desc, user_password, mod_password, moderators: { set: moderators ? moderators.map((m: { id: number }) => ({ id: m.id })) : [] } },
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
  const authError = await checkAuthorization(req, id);
  if (authError) return authError;
  try {
    await prisma.guessItRoom.delete({ where: { id } });
    return NextResponse.json({ message: 'Room deleted' }, { status: 200 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
