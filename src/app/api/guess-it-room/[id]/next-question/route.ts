import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDataFromToken } from '@/helpers/getDataFromToken';
import { broadcastGuessItQuizEnd, broadcastGuessItQuestionReleased } from '@/lib/guessItWsManager';

async function checkAuthorization(req: NextRequest, roomId: number) {
  const userIdFromToken = await getDataFromToken(req);
  if (!userIdFromToken) return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  const room = await prisma.guessItRoom.findUnique({ where: { id: roomId }, select: { hostId: true } });
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  if (String(userIdFromToken) !== String(room.hostId)) {
    return NextResponse.json({ error: 'Only the host can perform this action' }, { status: 403 });
  }
  return null;
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const roomId = parseInt(id, 10);
  if (isNaN(roomId)) return NextResponse.json({ error: 'Invalid Room ID' }, { status: 400 });
  const authError = await checkAuthorization(req, roomId);
  if (authError) return authError;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const room = await tx.guessItRoom.findUnique({
        where: { id: roomId }, include: { questions: true },
      });
      if (!room) throw new Error('Room not found');
      const maxOrder = room.questions.length > 0 ? Math.max(...room.questions.map(q => q.order)) : 0;
      const nextQ = room.currentQuestion + 1;
      if (nextQ > maxOrder) return { message: 'End of quiz reached.', currentQuestion: room.currentQuestion };
      const updated = await tx.guessItRoom.update({ where: { id: roomId }, data: { currentQuestion: nextQ } });
      return updated;
    });
    if ('message' in result && result.message === 'End of quiz reached.') {
      broadcastGuessItQuizEnd(roomId);
      return NextResponse.json(result, { status: 200 });
    }
    const nextQuestion = await prisma.guessItQuestion.findFirst({
      where: { guessItRoomId: roomId, order: result.currentQuestion },
      select: { id: true, text: true, order: true, hints: true },
    });
    if (nextQuestion) {
      broadcastGuessItQuestionReleased(roomId, nextQuestion);
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
