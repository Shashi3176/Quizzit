
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';



export async function PUT(_req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID format. ID must be a number." }, { status: 400 });
  }

  try {
    const quizRoom = await prisma.quizRoom.findUnique({ where: { id } });
    if (!quizRoom) {
      return NextResponse.json({ message: "Quiz room not found" }, { status: 404 });
    }

    const newLockState = !quizRoom.isLocked;

    // When locking (starting a quiz), reset currentQuestion to 0.
    // Questions are released manually by the host via the start-quiz page (WebSocket)
    // or via the next-question API endpoint. currentQuestion stays at 0 until then.
    const updatedQuizRoom = await prisma.quizRoom.update({
      where: { id },
      data: {
        isLocked: newLockState,
        ...(newLockState ? { currentQuestion: 0 } : {}),
      },
    });

    return NextResponse.json(updatedQuizRoom, { status: 200 });
  } catch (error) {
    console.error("Failed to update lock state:", error);
    return NextResponse.json({ message: "Failed to update lock state" }, { status: 500 });
  }
}
