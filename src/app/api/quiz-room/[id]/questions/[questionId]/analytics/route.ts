import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const params = await context.params;
    const { id: quizRoomId, questionId } = params;
    const qId = parseInt(questionId);

    const question = await prisma.question.findUnique({
      where: { id: qId }
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Get total participants in the room
    const totalParticipants = await prisma.participant.count({
      where: { quizRoomId: parseInt(quizRoomId) }
    });

    // Get count of submissions for this question
    const answeredCount = await prisma.participantAnswer.count({
      where: { questionId: qId }
    });

    const pendingCount = totalParticipants - answeredCount;

    // Calculate average response time and correct/wrong counts
    const participantAnswers = await prisma.participantAnswer.findMany({
      where: { questionId: qId },
      select: { responseTime: true, isCorrect: true }
    });

    const averageResponseTime = participantAnswers.length > 0
      ? participantAnswers.reduce((acc, ans) => acc + ans.responseTime, 0) / participantAnswers.length
      : 0;

    const correctCount = participantAnswers.filter(ans => ans.isCorrect).length;
    const wrongCount = participantAnswers.length - correctCount;

    // Get total points for this question
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

    // Save/update analytics to QuizAnalytics table
    await prisma.quizAnalytics.upsert({
      where: { questionId: qId },
      update: {
        participantCount: totalParticipants,
        answeredCount,
        pendingCount,
        averageResponseTime,
      },
      create: {
        quizRoomId: parseInt(quizRoomId),
        questionId: qId,
        participantCount: totalParticipants,
        answeredCount,
        pendingCount,
        averageResponseTime,
        answerDistribution: {},
      },
    });

    return NextResponse.json(analyticsData);
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}