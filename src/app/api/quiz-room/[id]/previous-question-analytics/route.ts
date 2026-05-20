import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const quizRoomId = parseInt(params.id);
    const body = await request.json();

    const {
      questionId,
      questionOrder,
      questionText,
      points,
      answerDistribution,
      averageResponseTime,
      participantCount,
      answeredCount,
      correctCount,
      wrongCount,
      pendingCount
    } = body;

    const previousAnalytics = await prisma.previousQuestionAnalytics.create({
      data: {
        quizRoomId,
        questionId,
        questionOrder,
        questionText,
        points,
        answerDistribution: answerDistribution || {},
        averageResponseTime: averageResponseTime || 0,
        participantCount,
        answeredCount,
        correctCount,
        wrongCount,
        pendingCount
      }
    });

    return NextResponse.json(previousAnalytics, { status: 201 });
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const quizRoomId = parseInt(params.id);

    const analytics = await prisma.previousQuestionAnalytics.findMany({
      where: { quizRoomId },
      orderBy: { createdAt: 'desc' },
      take: 1
    });

    return NextResponse.json(analytics[0] || null);
  } catch (error) {
    console.error('Error in previous-question-analytics GET:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}