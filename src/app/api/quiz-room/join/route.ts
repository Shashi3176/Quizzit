
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

    const quizRoom = await prisma.quizRoom.findUnique({
      where: { id: parseInt(roomId) },
    });

    if (!quizRoom) {
      return NextResponse.json({ error: 'Quiz room not found' }, { status: 404 });
    }
    const getRoomData = async () => {
        const questions = await prisma.question.findMany({
            where: { quizRoomId: quizRoom.id },
            orderBy: { order: 'asc' },
        });

        const participants = await prisma.participant.findMany({
            where: { quizRoomId: quizRoom.id },
        });
        
        // Get moderators via the relation
        const roomWithModerators = await prisma.quizRoom.findUnique({
            where: { id: quizRoom.id },
            include: { moderators: true }
        });
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { user_password: _user_password, mod_password: _mod_password, ...roomDetails } = quizRoom;

        return { ...roomDetails, questions, participants, moderators: roomWithModerators?.moderators || [] };
    }

    const createParticipant = async () => {
        const existingParticipant = await prisma.participant.findFirst({
            where: {
                userId: String(user.id),
                quizRoomId: quizRoom.id,
            },
        });

        if (!existingParticipant) {
            await prisma.participant.create({
                data: {
                    quizRoomId: quizRoom.id,
                    name: user.username,
                    userId: String(user.id)
                }
            });
        }
    };

    if (role === 'user' && password === quizRoom.user_password) {
      await createParticipant();
      const roomData = await getRoomData();
      return NextResponse.json({ ...roomData, role: 'user' });
    } else if (role === 'moderator' && password === quizRoom.mod_password) {
      // Add moderator to the quiz room's moderators relation
      await prisma.quizRoom.update({
        where: { id: quizRoom.id },
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
