import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string; questionId: string }> }) {
  const params = await context.params;
  const roomId = parseInt(params.id);
  const order = parseInt(params.questionId);
  if (isNaN(order) || isNaN(roomId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  try {
    const question = await prisma.guessItQuestion.findUnique({
      where: { guessItRoomId_order: { guessItRoomId: roomId, order } },
    });
    if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    const guesses = await prisma.guessItAnswer.findMany({
      where: { guessItQuestionId: question.id },
      include: { participant: { select: { id: true, name: true, score: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(guesses, { status: 200 });
  } catch (error) {
    console.error('Error fetching guesses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
