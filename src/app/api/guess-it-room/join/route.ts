import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDataFromToken } from '@/helpers/getDataFromToken';

export async function POST(req: NextRequest) {
  const { roomId, password, role } = await req.json();
  if (!roomId || !password || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  try {
    const userId = await getDataFromToken(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const room = await prisma.guessItRoom.findUnique({ where: { id: parseInt(roomId) } });
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    const getRoomData = async () => {
      const questions = await prisma.guessItQuestion.findMany({
        where: { guessItRoomId: room.id }, orderBy: { order: 'asc' }, include: { acceptableAnswers: true },
      });
      const participants = await prisma.participant.findMany({ where: { guessItRoomId: room.id } });
      const roomWithMods = await prisma.guessItRoom.findUnique({ where: { id: room.id }, include: { moderators: true } });
      const { user_password: _up, mod_password: _mp, ...details } = room;
      return { ...details, questions, participants, moderators: roomWithMods?.moderators || [] };
    };

    const createParticipant = async () => {
      const existing = await prisma.participant.findFirst({ where: { userId: String(user.id), guessItRoomId: room.id } });
      if (!existing) {
        await prisma.participant.create({ data: { guessItRoomId: room.id, name: user.username, userId: String(user.id) } });
      }
    };

    if (role === 'user' && password === room.user_password) {
      await createParticipant();
      const roomData = await getRoomData();
      return NextResponse.json({ ...roomData, role: 'user' });
    } else if (role === 'moderator' && password === room.mod_password) {
      await prisma.guessItRoom.update({ where: { id: room.id }, data: { moderators: { connect: { id: user.id } } } });
      const roomData = await getRoomData();
      return NextResponse.json({ ...roomData, role: 'moderator' });
    } else {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
