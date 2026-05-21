
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDataFromToken } from '@/helpers/getDataFromToken';



export async function GET(request: NextRequest) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { username: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch Quiz Room participants
    const quizParticipants = await prisma.participant.findMany({
      where: { userId: String(userId), quizRoomId: { gt: 0 } },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
        quizRoom: true,
      },
      orderBy: { id: 'desc' },
    });

    // Fetch Guess It Room participants
    const guessItParticipants = await prisma.participant.findMany({
      where: { userId: String(userId), guessItRoomId: { gt: 0 } },
      include: {
        guessItAnswers: {
          include: {
            guessItQuestion: {
              include: {
                acceptableAnswers: true,
              },
            },
          },
        },
        guessItRoom: true,
      },
      orderBy: { id: 'desc' },
    });

    const quizzes = await Promise.all(
      quizParticipants.map(async (participant) => {
        const totalQuestions = participant.quizRoomId
          ? await prisma.question.count({ where: { quizRoomId: participant.quizRoomId } })
          : 0;

        return {
          type: 'quiz' as const,
          quizRoomId: participant.quizRoomId,
          quizRoomName: participant.quizRoom?.title ?? 'Unknown',
          finalScore: participant.score,
          finalRank: participant.rank,
          totalQuestions: totalQuestions,
          answeredQuestions: participant.answers.length,
          correctAnswers: participant.answers.filter(ans => ans.isCorrect).length,
          incorrectAnswers: participant.answers.filter(ans => !ans.isCorrect).length,
          averageResponseTime: participant.answers.length > 0
            ? participant.answers.reduce((acc, ans) => acc + ans.responseTime, 0) / participant.answers.length
            : 0,
          answers: participant.answers.map(ans => ({
            question: ans.question.text,
            yourAnswer: ans.answer,
            correctAnswer: ans.question.correctAnswer,
            isCorrect: ans.isCorrect,
            score: ans.score,
          })),
        };
      })
    );

    const guessItRooms = await Promise.all(
      guessItParticipants.map(async (participant) => {
        const totalQuestions = participant.guessItRoomId
          ? await prisma.guessItQuestion.count({ where: { guessItRoomId: participant.guessItRoomId } })
          : 0;

        return {
          type: 'guessIt' as const,
          guessItRoomId: participant.guessItRoomId,
          guessItRoomName: participant.guessItRoom?.title ?? 'Unknown',
          finalScore: participant.score,
          finalRank: participant.rank,
          totalQuestions: totalQuestions,
          answeredQuestions: participant.guessItAnswers.length,
          correctAnswers: participant.guessItAnswers.filter(ans => ans.isCorrect).length,
          incorrectAnswers: participant.guessItAnswers.filter(ans => !ans.isCorrect).length,
          answers: participant.guessItAnswers.map(ans => ({
            question: ans.guessItQuestion.text,
            yourAnswer: ans.answer,
            correctAnswer: ans.guessItQuestion.acceptableAnswers.map(a => a.answer).join(', '),
            isCorrect: ans.isCorrect,
            score: ans.score,
            guessNumber: ans.guessNumber,
            hintsRevealed: ans.hintsRevealed,
          })),
        };
      })
    );

    return NextResponse.json({ user, quizzes, guessItRooms });
  } catch (error) {
    console.error('Performance API error:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
