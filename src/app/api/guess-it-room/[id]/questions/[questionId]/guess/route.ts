import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDataFromToken } from '@/helpers/getDataFromToken';

const HINT_POINTS = [50, 40, 30, 20, 10];
const GUESS_BONUS = [20, 10, 0];

export async function POST(req: NextRequest, context: { params: Promise<{ id: string; questionId: string }> }) {
  const params = await context.params;
  const roomId = params.id;
  const questionOrder = params.questionId;
  const { answer, hintsRevealed } = await req.json();
  const userIdFromToken = await getDataFromToken(req);

  if (!answer || typeof answer !== 'string') {
    return NextResponse.json({ error: 'Answer is required' }, { status: 400 });
  }
  if (hintsRevealed === undefined || hintsRevealed < 1 || hintsRevealed > 5) {
    return NextResponse.json({ error: 'Valid hintsRevealed (1-5) is required' }, { status: 400 });
  }
  if (!userIdFromToken) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const room = await tx.guessItRoom.findUnique({ where: { id: Number(roomId) } });
      if (!room) throw new Error('Room not found');

      const participant = await tx.participant.findFirst({
        where: { userId: String(userIdFromToken), guessItRoomId: Number(roomId) },
      });
      if (!participant) return { error: 'You are not a participant in this room.' };

      const question = await tx.guessItQuestion.findUnique({
        where: { guessItRoomId_order: { guessItRoomId: Number(roomId), order: Number(questionOrder) } },
        include: { acceptableAnswers: true },
      });
      if (!question) return { error: 'Question not found' };

      if (room.currentQuestion === 0) return { error: 'Quiz has not started yet.' };
      if (question.order !== room.currentQuestion) return { error: 'This question is not currently active.' };

      const existingGuesses = await tx.guessItAnswer.findMany({
        where: { participantId: participant.id, guessItQuestionId: question.id },
        orderBy: { guessNumber: 'asc' },
      });

      if (existingGuesses.some(g => g.isCorrect)) {
        return { error: 'You have already answered this question correctly.' };
      }

      const guessNumber = existingGuesses.length + 1;
      if (guessNumber > 3) {
        return { error: 'You have exhausted all 3 guesses for this question.' };
      }

      const normalizedAnswer = answer.trim().toLowerCase();
      const isCorrect = question.acceptableAnswers.some(
        ca => ca.answer.toLowerCase() === normalizedAnswer
      );

      let score = 0;
      if (isCorrect) {
        const hintPoints = HINT_POINTS[hintsRevealed - 1] || 10;
        const bonus = GUESS_BONUS[guessNumber - 1] || 0;
        score = hintPoints + bonus;
      }

      await tx.guessItAnswer.create({
        data: {
          participantId: participant.id,
          guessItQuestionId: question.id,
          answer: answer.trim(),
          isCorrect,
          guessNumber,
          hintsRevealed,
          score,
        },
      });

      if (isCorrect) {
        await tx.participant.update({
          where: { id: participant.id },
          data: { score: { increment: score } },
        });
      }

      return { success: true, isCorrect, score, guessNumber, guessesRemaining: 3 - guessNumber };
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Failed to process guess:', error);
    const msg = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Failed to process guess.', details: msg }, { status: 500 });
  }
}
