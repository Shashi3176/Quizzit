import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function PUT(_req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID format. ID must be a number." }, { status: 400 });
  }

  try {
    const room = await prisma.guessItRoom.findUnique({ where: { id } });
    if (!room) {
      return NextResponse.json({ message: "Guess-it room not found" }, { status: 404 });
    }

    const newLockState = !room.isLocked;

    const updatedRoom = await prisma.guessItRoom.update({
      where: { id },
      data: {
        isLocked: newLockState,
        ...(newLockState ? { currentQuestion: 0 } : {}),
      },
    });

    return NextResponse.json(updatedRoom, { status: 200 });
  } catch (error) {
    console.error("Failed to update lock state:", error);
    return NextResponse.json({ message: "Failed to update lock state" }, { status: 500 });
  }
}
