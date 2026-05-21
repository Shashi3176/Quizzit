import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string; questionId: string }> }) {
  const params = await context.params;
  const roomId = parseInt(params.id);
  const questionOrder = parseInt(params.questionId);
  if (isNaN(questionOrder) || isNaN(roomId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  try {
    const question = await prisma.the100Question.findUnique({
      where: { the100RoomId_order: { the100RoomId: roomId, order: questionOrder } },
    });
    if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

    const answers = await prisma.the100Answer.findMany({
      where: { the100QuestionId: question.id },
      include: { participant: { select: { id: true, name: true, score: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(answers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
