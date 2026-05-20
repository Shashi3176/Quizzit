import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const quizRoomId = parseInt(params.id);

    // Get all questions with their analytics
    const questions = await prisma.question.findMany({
      where: { quizRoomId },
      orderBy: { order: 'asc' },
      include: {
        analytics: true
      }
    });

    // Get total participants in the room
    const totalParticipants = await prisma.participant.count({
      where: { quizRoomId }
    });

    const questionsAnalytics = questions.map(q => ({
      questionId: q.id,
      questionOrder: q.order,
      questionText: q.text,
      points: q.points,
      answeredCount: q.analytics?.answeredCount || 0,
      pendingCount: totalParticipants - (q.analytics?.answeredCount || 0),
      averageResponseTime: q.analytics?.averageResponseTime || 0,
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