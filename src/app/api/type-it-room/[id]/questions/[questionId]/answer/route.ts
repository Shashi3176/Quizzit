import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getDataFromToken } from "@/helpers/getDataFromToken";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string; questionId: string }> }) {
  const params = await context.params;
  const roomId = params.id;
  const questionId = params.questionId;

  const { answer, responseTime } = await req.json();
  const userIdFromToken = await getDataFromToken(req);

  if (answer === undefined || answer === null || answer === '') {
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

      const room = await tx.typeItRoom.findUnique({
        where: { id: Number(roomId) },
      });

      if (!room) {
        throw new Error("TypeIt room not found.");
      }

      const participant = await tx.participant.findFirst({
        where: {
          userId: String(userIdFromToken),
          typeItRoomId: Number(roomId),
        },
      });  

      if (!participant) {
        return { error: "You are not a participant in this room. Please join the room first." };
      }

      const question = await tx.typeItQuestion.findUnique({
        where: {
          id: Number(questionId)
        },
      });

      if (!question) {
        return { error: "Question not found." };
      }

      if (room.currentQuestion === 0) {
        return { error: "The quiz has not started yet. No question has been released." };
      }

      if (question.order !== room.currentQuestion) {
        return { error: `This question is not currently active. The active question is #${room.currentQuestion}.` };
      }

      const existingAnswer = await tx.typeItAnswer.findFirst({
        where: {
          participantId: participant.id,
          typeItQuestionId: question.id,
        },
      });

      if (existingAnswer) {
        return { error: "You have already answered this question." };
      }

      const timeLimit = question.timeLimit || 30;
      const isTooLate = responseTime > timeLimit;

      // Check if the typed answer matches any of the correct answers (case-insensitive, trimmed)
      const correctAnswers = question.correctAnswers as string[];
      const trimmedAnswer = String(answer).trim().toLowerCase();
      const isCorrect = !isTooLate && correctAnswers.some(
        (correct) => String(correct).trim().toLowerCase() === trimmedAnswer
      );

      let score = 0;
      if (isCorrect) {
        const pointsLost = Math.floor(responseTime / 3);
        score = Math.max(0, question.points - pointsLost);
      }

      await tx.typeItAnswer.create({
        data: {
          participantId: participant.id,
          typeItQuestionId: question.id,
          answer: String(answer),
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
