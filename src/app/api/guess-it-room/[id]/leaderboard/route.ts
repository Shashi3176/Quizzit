import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const roomId = params.id;
  try {
    const participants = await prisma.participant.findMany({
      where: { guessItRoomId: Number(roomId) },
      orderBy: { score: 'desc' },
    });
    return NextResponse.json(participants, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard.' }, { status: 500 });
  }
}
