import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const params = await context.params;
    const { id: roomId, questionId } = params;
    const qId = parseInt(questionId);

    const question = await prisma.typeItQuestion.findUnique({
      where: { id: qId }
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const totalParticipants = await prisma.participant.count({
      where: { typeItRoomId: parseInt(roomId) }
    });

    const answeredCount = await prisma.typeItAnswer.count({
      where: { typeItQuestionId: qId }
    });

    const pendingCount = totalParticipants - answeredCount;

    const participantAnswers = await prisma.typeItAnswer.findMany({
      where: { typeItQuestionId: qId },
      select: { responseTime: true, isCorrect: true }
    });

    const averageResponseTime = participantAnswers.length > 0
      ? participantAnswers.reduce((acc, ans) => acc + ans.responseTime, 0) / participantAnswers.length
      : 0;

    const correctCount = participantAnswers.filter(ans => ans.isCorrect).length;
    const wrongCount = participantAnswers.length - correctCount;

    const totalPoints = question.points || 0;

    const analyticsData = {
      participantCount: totalParticipants,
      answeredCount,
      correctCount,
      wrongCount,
      pendingCount,
      averageResponseTime,
      totalPoints,
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
