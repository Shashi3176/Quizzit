import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../../lib/prisma';
import { getDataFromToken } from '@/helpers/getDataFromToken';
import { broadcastGuessItGuessSubmitted, broadcastGuessItLeaderboardUpdate } from '@/lib/guessItWsManager';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id: roomId, questionId } = await context.params;
    const reqBody = await request.json();
    const { answer, hintsRevealed } = reqBody;

    const user = await getDataFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userDetails = await prisma.user.findUnique({
      where: { id: parseInt(user) },
      select: { id: true, username: true }
    });

    if (!userDetails) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const participant = await prisma.participant.findFirst({
      where: {
        name: userDetails.username,
        guessItRoomId: parseInt(roomId),
      }
    });

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    // Find the question by order
    const question = await prisma.guessItQuestion.findUnique({
      where: {
        guessItRoomId_order: {
          guessItRoomId: parseInt(roomId),
          order: Number(questionId)
        }
      },
      include: { acceptableAnswers: true }
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Count previous guesses for this participant on this question
    const previousGuessCount = await prisma.guessItAnswer.count({
      where: {
        participantId: participant.id,
        guessItQuestionId: question.id,
      }
    });

    const guessNumber = previousGuessCount + 1;

    if (guessNumber > 3) {
      return NextResponse.json({
        error: 'No more guesses allowed',
        isCorrect: false,
        guessNumber: 3,
        lockedOut: true
      }, { status: 400 });
    }

    // Check if already answered correctly
    const existingCorrect = await prisma.guessItAnswer.findFirst({
      where: {
        participantId: participant.id,
        guessItQuestionId: question.id,
        isCorrect: true,
      }
    });

    if (existingCorrect) {
      return NextResponse.json({
        error: 'Already answered correctly',
        isCorrect: true,
        score: existingCorrect.score
      }, { status: 400 });
    }

    // Check answer against acceptable answers (case-insensitive, trimmed)
    const trimmedAnswer = answer.toLowerCase().trim();
    const isCorrect = question.acceptableAnswers.some(
      (ca) => ca.answer.toLowerCase().trim() === trimmedAnswer
    );

    // Calculate score
    let score = 0;
    if (isCorrect) {
      const hintPoints = (function() { const HP=[50,40,30,20,10]; return HP[hintsRevealed-1]||10; })();
      const guessBonuses = [20,10,0];
      const guessBonus = [20,10,0][guessNumber - 1] || 0;
      score = Math.max(0, hintPoints + guessBonus);
    }

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create the guess answer
      const guessAnswer = await tx.guessItAnswer.create({
        data: {
          participantId: participant.id,
          guessItQuestionId: question.id,
          answer: answer,
          isCorrect,
          guessNumber,
          hintsRevealed,
          score,
        },
      });

      // Update participant score if correct
      if (isCorrect) {
        await tx.participant.update({
          where: { id: participant.id },
          data: {
            score: {
              increment: score,
            },
          },
        });
      }

      // Update ranks
      const allParticipants = await tx.participant.findMany({
        where: { guessItRoomId: parseInt(roomId) },
        orderBy: { score: 'desc' },
      });

      const rankUpdates = allParticipants.map((p, index) => {
        return tx.participant.update({
          where: { id: p.id },
          data: { rank: index + 1 },
        });
      });

      await Promise.all(rankUpdates);

      return guessAnswer;
    });

    // Broadcast guess submission to moderators
    broadcastGuessItGuessSubmitted(
      parseInt(roomId),
      participant.id,
      question.id,
      isCorrect,
      score
    );

    // Get updated leaderboard and broadcast to all participants
    const updatedLeaderboard = await prisma.participant.findMany({
      where: { guessItRoomId: parseInt(roomId) },
      select: { id: true, name: true, score: true, rank: true },
      orderBy: { rank: 'asc' },
    });

    broadcastGuessItLeaderboardUpdate(parseInt(roomId), updatedLeaderboard);

    return NextResponse.json({
      message: isCorrect ? 'Correct guess!' : 'Incorrect guess',
      isCorrect,
      score,
      guessNumber,
      lockedOut: !isCorrect && guessNumber >= 3,
    });
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
