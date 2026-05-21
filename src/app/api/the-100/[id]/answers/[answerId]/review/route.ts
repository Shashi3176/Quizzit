import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { broadcastThe100AnswerReviewed, broadcastThe100LeaderboardUpdate } from '@/lib/the100WsManager';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string; answerId: string }> }) {
  const params = await context.params;
  const roomId = parseInt(params.id);
  const answerId = parseInt(params.answerId);
  const { status, score } = await req.json();

  if (isNaN(roomId) || isNaN(answerId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  if (!status || !['accepted', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Status must be "accepted" or "rejected"' }, { status: 400 });
  }

  if (status === 'accepted' && (typeof score !== 'number' || score < 0)) {
    return NextResponse.json({ error: 'Valid score is required for accepted answers' }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const answer = await tx.the100Answer.findUnique({
        where: { id: answerId },
        include: { participant: true, the100Question: true },
      });

      if (!answer) throw new Error('Answer not found');
      if (answer.status !== 'pending') throw new Error('Answer has already been reviewed');

      const finalScore = status === 'accepted' ? score : 0;

      const updatedAnswer = await tx.the100Answer.update({
        where: { id: answerId },
        data: { status, score: finalScore },
      });

      if (status === 'accepted') {
        await tx.participant.update({
          where: { id: answer.participantId },
          data: { score: { increment: finalScore } },
        });
      }

      return {
        answerId: updatedAnswer.id,
        participantId: answer.participantId,
        participantName: answer.participant.name,
        status,
        score: finalScore,
        questionId: answer.the100QuestionId,
      };
    });

    broadcastThe100AnswerReviewed(roomId, {
      participantId: result.participantId,
      participantName: result.participantName,
      answerId: result.answerId,
      status: result.status,
      score: result.score,
      questionId: result.questionId,
    });

    const participants = await prisma.participant.findMany({
      where: { the100RoomId: roomId },
      orderBy: { score: 'desc' },
    });

    broadcastThe100LeaderboardUpdate(roomId, participants);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Failed to review answer:', error);
    const msg = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
