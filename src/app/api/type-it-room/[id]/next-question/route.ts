import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getDataFromToken } from "@/helpers/getDataFromToken";

async function checkAuthorization(req: NextRequest, roomId: number) {
    const userIdFromToken = await getDataFromToken(req);
    if (!userIdFromToken) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const room = await prisma.typeItRoom.findUnique({
        where: { id: roomId },
        select: { hostId: true }
    });

    if (!room) {
        return NextResponse.json({ error: "TypeIt room not found" }, { status: 404 });
    }
    
    if (String(userIdFromToken) !== String(room.hostId)) {
        return NextResponse.json({ error: "Only the host can perform this action" }, { status: 403 });
    }

    return null;
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const roomId = parseInt(id, 10);

  if (isNaN(roomId)) {
    return NextResponse.json({ error: "Invalid Room ID" }, { status: 400 });
  }

  const authError = await checkAuthorization(req, roomId);
  if (authError) {
      return authError;
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
        const room = await tx.typeItRoom.findUnique({
            where: { id: roomId },
            include: { questions: true }
        });

        if (!room) {
            throw new Error("TypeIt room not found.");
        }

        const maxQuestionOrder = room.questions.length > 0 ? Math.max(...room.questions.map(q => q.order)) : 0;
        
        const nextQuestion = room.currentQuestion + 1;

        if (nextQuestion > maxQuestionOrder) {
            return { message: "End of quiz reached.", currentQuestion: room.currentQuestion };
        }
        
        const updatedRoom = await tx.typeItRoom.update({
            where: { id: roomId },
            data: {
                currentQuestion: nextQuestion
            },
        });
        
        return updatedRoom;
    });

     if ('message' in result && result.message === "End of quiz reached.") {
       return NextResponse.json(result, { status: 200 });
     }

     return NextResponse.json(result, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Failed to advance to next question:", error);
    return NextResponse.json({ error: "Failed to advance to next question.", details: errorMessage }, { status: 500 });
  }
}
