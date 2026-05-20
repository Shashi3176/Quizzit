
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getDataFromToken } from "@/helpers/getDataFromToken";



export async function POST(req: NextRequest, context: { params: Promise<{ id: string; questionId: string }> }) {
  const params = await context.params;
  const roomId = params.id;
  const questionId = params.questionId;

  const { answer, responseTime } = await req.json();
  const userIdFromToken = await getDataFromToken(req);

  if (answer === undefined || answer === null) {
    return NextResponse.json({ error: "Answer is required" }, { status: 400 });
  }

  if (responseTime === undefined || responseTime === null || typeof responseTime !== 'number') {
    return NextResponse.json({ error: "Response time is required" }, { status: 400 });
  }

  if (!userIdFromToken) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {

      const room = await tx.quizRoom.findUnique({
        where: { id: Number(roomId) },
      });

      if (!room) {
        throw new Error("Quiz room not found.");
      }

      const participant = await tx.participant.findFirst({
        where: {
          userId: String(userIdFromToken),
          quizRoomId: Number(roomId),
        },
      });  

      if (!participant) {
        return { error: "You are not a participant in this room. Please join the room first." };
      }

      const question = await tx.question.findUnique({
        where: {
          id: Number(questionId)
        },
      });

      if (!question) {
        return { error: "Question not found." };
      }

      // Validate that the question being answered is the currently released question
      if (room.currentQuestion === 0) {
        return { error: "The quiz has not started yet. No question has been released." };
      }

      if (question.order !== room.currentQuestion) {
        return { error: `This question is not currently active. The active question is #${room.currentQuestion}.` };
      }

      const existingAnswer = await tx.participantAnswer.findFirst({
        where: {
          participantId: participant.id,
          questionId: question.id,
        },
      });

      if (existingAnswer) {
        return { error: "You have already answered this question." };
      }

      // Check if time limit exceeded
      const timeLimit = question.timeLimit || 30;
      const isTooLate = responseTime > timeLimit;

      const isCorrect = !isTooLate && JSON.stringify(question.correctAnswer) === JSON.stringify(answer);

      // Time-based scoring: lose points proportional to response time
      // pointsLost = (responseTime / timeLimit) * question.points
      let score = 0;
      if (isCorrect) {
        const pointsLost = (responseTime / timeLimit) * question.points;
        score = Math.max(0, question.points - pointsLost);
      }

      await tx.participantAnswer.create({
        data: {
          participantId: participant.id,
          questionId: question.id,
          answer: answer,
          responseTime: responseTime,
          isCorrect: isCorrect,
          score: score,
        },
      });

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

      return { success: true, isCorrect, score };
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("Failed to process answer:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: "Failed to process answer.", details: errorMessage }, { status: 500 });
  }
}
