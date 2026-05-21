import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const guessItRoomId = parseInt(params.id);

    // Get all questions with their answers
    const questions = await prisma.guessItQuestion.findMany({
      where: { guessItRoomId },
      orderBy: { order: 'asc' },
      include: {
        answers: true
      }
    });

    // Get total participants in the room
    const totalParticipants = await prisma.participant.count({
      where: { guessItRoomId }
    });

    const questionsAnalytics = questions.map(q => {
      const answeredCount = q.answers.length;
      const correctCount = q.answers.filter(a => a.isCorrect).length;
      const avgTime = answeredCount > 0
        ? 0 // GuessItAnswer doesn't have responseTime, use 0
        : 0;

      return {
        questionId: q.id,
        questionOrder: q.order,
        questionText: q.text,
        points: 70,
        answeredCount,
        pendingCount: totalParticipants - answeredCount,
        averageResponseTime: avgTime,
      };
    });

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
