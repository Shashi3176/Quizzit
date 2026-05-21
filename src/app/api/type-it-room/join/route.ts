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
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const room = await prisma.typeItRoom.findUnique({
      where: { id: parseInt(roomId) },
    });

    if (!room) {
      return NextResponse.json({ error: 'TypeIt room not found' }, { status: 404 });
    }
    const getRoomData = async () => {
        const questions = await prisma.typeItQuestion.findMany({
            where: { typeItRoomId: room.id },
            orderBy: { order: 'asc' },
        });

        const participants = await prisma.participant.findMany({
            where: { typeItRoomId: room.id },
        });
        
        const roomWithModerators = await prisma.typeItRoom.findUnique({
            where: { id: room.id },
            include: { moderators: true }
        });
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { user_password: _user_password, mod_password: _mod_password, ...roomDetails } = room;

        return { ...roomDetails, questions, participants, moderators: roomWithModerators?.moderators || [] };
    }

    const createParticipant = async () => {
        const existingParticipant = await prisma.participant.findFirst({
            where: {
                userId: String(user.id),
                typeItRoomId: room.id,
            },
        });

        if (!existingParticipant) {
            await prisma.participant.create({
                data: {
                    typeItRoomId: room.id,
                    name: user.username,
                    userId: String(user.id)
                }
            });
        }
    };

    if (role === 'user' && password === room.user_password) {
      await createParticipant();
      const roomData = await getRoomData();
      return NextResponse.json({ ...roomData, role: 'user' });
    } else if (role === 'moderator' && password === room.mod_password) {
      await prisma.typeItRoom.update({
        where: { id: room.id },
        data: {
          moderators: {
            connect: { id: user.id }
          }
        }
      });
      
      const roomData = await getRoomData();
      return NextResponse.json({ ...roomData, role: 'moderator' });
    } else {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
