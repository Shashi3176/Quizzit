import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDataFromToken } from '@/helpers/getDataFromToken';
import { broadcastThe100AnswerSubmitted } from '@/lib/the100WsManager';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string; questionId: string }> }) {
  const params = await context.params;
  const roomId = params.id;
  const questionOrder = params.questionId;
  const { answer } = await req.json();
  const userIdFromToken = await getDataFromToken(req);

  if (!answer || typeof answer !== 'string' || !answer.trim()) {
    return NextResponse.json({ error: 'Answer is required' }, { status: 400 });
  }
  if (!userIdFromToken) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    const room = await prisma.the100Room.findUnique({ where: { id: Number(roomId) } });
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    const participant = await prisma.participant.findFirst({
      where: { userId: String(userIdFromToken), the100RoomId: Number(roomId) },
    });
    if (!participant) return NextResponse.json({ error: 'You are not a participant in this room.' }, { status: 403 });

    const question = await prisma.the100Question.findUnique({
      where: { the100RoomId_order: { the100RoomId: Number(roomId), order: Number(questionOrder) } },
    });
    if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

    if (room.currentQuestion === 0) return NextResponse.json({ error: 'Quiz has not started yet.' }, { status: 400 });
    if (question.order !== room.currentQuestion) return NextResponse.json({ error: 'This question is not currently active.' }, { status: 400 });

    const the100Answer = await prisma.the100Answer.create({
      data: {
        participantId: participant.id,
        the100QuestionId: question.id,
        answer: answer.trim(),
        status: 'pending',
        score: 0,
      },
    });

    broadcastThe100AnswerSubmitted(Number(roomId), {
      participantId: participant.id,
      participantName: participant.name,
      answerId: the100Answer.id,
      answer: the100Answer.answer,
      questionId: question.id,
    });

    return NextResponse.json({ success: true, answerId: the100Answer.id, status: 'pending' }, { status: 201 });
  } catch (error) {
    console.error('Failed to submit answer:', error);
    const msg = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Failed to submit answer.', details: msg }, { status: 500 });
  }
}
