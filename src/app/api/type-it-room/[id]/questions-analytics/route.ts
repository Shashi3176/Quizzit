import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const roomId = parseInt(params.id);

    const questions = await prisma.typeItQuestion.findMany({
      where: { typeItRoomId: roomId },
      orderBy: { order: 'asc' },
    });

    const totalParticipants = await prisma.participant.count({
      where: { typeItRoomId: roomId }
    });

    const questionsAnalytics = await Promise.all(questions.map(async (q) => {
      const answeredCount = await prisma.typeItAnswer.count({
        where: { typeItQuestionId: q.id }
      });
      const answers = await prisma.typeItAnswer.findMany({
        where: { typeItQuestionId: q.id },
        select: { responseTime: true }
      });
      const averageResponseTime = answers.length > 0
        ? answers.reduce((acc, a) => acc + a.responseTime, 0) / answers.length
        : 0;

      return {
        questionId: q.id,
        questionOrder: q.order,
        questionText: q.text,
        points: q.points,
        answeredCount,
        pendingCount: totalParticipants - answeredCount,
        averageResponseTime,
      };
    }));

    return NextResponse.json({
      totalParticipants,
      questions: questionsAnalytics
    });
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
