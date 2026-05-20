import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = params.id;
  try {
    const quizRoom = await prisma.quizRoom.findUnique({
      where: { id: parseInt(id) },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        participants: {
          orderBy: { score: 'desc' },
        },
      },
    });

    if (!quizRoom) {
      return NextResponse.json({ error: 'Quiz room not found' }, { status: 404 });
    }

    return NextResponse.json(quizRoom);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
