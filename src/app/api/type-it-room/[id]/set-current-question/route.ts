import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const roomId = parseInt(id, 10);

  if (isNaN(roomId)) {
    return NextResponse.json({ error: "Invalid Room ID" }, { status: 400 });
  }

  try {
    const { questionOrder } = await req.json();

    if (typeof questionOrder !== 'number' || questionOrder < 1) {
      return NextResponse.json({ error: "Invalid questionOrder" }, { status: 400 });
    }

    const updatedRoom = await prisma.typeItRoom.update({
      where: { id: roomId },
      data: { currentQuestion: questionOrder },
    });

    return NextResponse.json({ currentQuestion: updatedRoom.currentQuestion }, { status: 200 });
  } catch (error) {
    console.error("Failed to set current question:", error);
    return NextResponse.json({ error: "Failed to set current question" }, { status: 500 });
  }
}
