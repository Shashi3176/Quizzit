
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { wsManager } from "@/lib/websocketManager";



// Helper to check if the user is authorized (host or moderator)
async function checkAuthorization(req: NextRequest, roomId: number) {
    const userIdFromToken = await getDataFromToken(req);
    if (!userIdFromToken) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const room = await prisma.quizRoom.findUnique({
        where: { id: roomId },
        select: { hostId: true }
    });

    if (!room) {
        return NextResponse.json({ error: "Quiz room not found" }, { status: 404 });
    }
    
    // In a real app, you would also check for moderators
    if (String(userIdFromToken) !== String(room.hostId)) {
        return NextResponse.json({ error: "Only the host can perform this action" }, { status: 403 });
    }

    return null; // User is authorized
}


export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const roomId = parseInt(id, 10);

  if (isNaN(roomId)) {
    return NextResponse.json({ error: "Invalid Room ID" }, { status: 400 });
  }

  // Check if the user is the host
  const authError = await checkAuthorization(req, roomId);
  if (authError) {
      return authError;
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
        const room = await tx.quizRoom.findUnique({
            where: { id: roomId },
            include: { questions: true }
        });

        if (!room) {
            throw new Error("Quiz room not found.");
        }

        const maxQuestionOrder = room.questions.length > 0 ? Math.max(...room.questions.map(q => q.order)) : 0;
        
        const nextQuestion = room.currentQuestion + 1;

        // If we are advancing beyond the last question, set it to a "finished" state (e.g., max + 1 or 0)
        if (nextQuestion > maxQuestionOrder) {
            // Optionally, you could set it to 0 or a specific "end" value
            // For now, let's cap it to prevent errors, and the host can decide to end the quiz.
            return { message: "End of quiz reached.", currentQuestion: room.currentQuestion };
        }
        
        const updatedRoom = await tx.quizRoom.update({
            where: { id: roomId },
            data: {
                currentQuestion: nextQuestion
            },
        });
        
        return updatedRoom;
    });

     // Check if we reached the end of the quiz
     if ('message' in result && result.message === "End of quiz reached.") {
       // Broadcast quiz end event
       wsManager.broadcastQuizEnd(roomId);
       return NextResponse.json(result, { status: 200 });
     }

     // Get the next question to broadcast
     const nextQuestion = await prisma.question.findFirst({
       where: { quizRoomId: roomId, order: result.currentQuestion },
       select: { id: true, text: true, options: true, order: true, timeLimit: true, points: true }
     });

     if (nextQuestion) {
       // Broadcast the new question to all participants via WebSocket
       wsManager.broadcastQuestionReleased(roomId, nextQuestion);
     }

     return NextResponse.json(result, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Failed to advance to next question:", error);
    return NextResponse.json({ error: "Failed to advance to next question.", details: errorMessage }, { status: 500 });
  }
}
