import { getDataFromToken } from '@/helpers/getDataFromToken';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const hostId = await getDataFromToken(req);
    const nHostId = Number(hostId);
    if (!hostId) {
      return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
    }
    const { title, desc, user_password, mod_password } = await req.json();
    const newRoom = await prisma.the100Room.create({
      data: { hostId: nHostId, title, desc, user_password, mod_password },
    });
    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const hostId = await getDataFromToken(req);
    const nHostId = Number(hostId);
    if (!hostId) {
      return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
    }
    const rooms = await prisma.the100Room.findMany({ where: { hostId: nHostId } });
    return NextResponse.json(rooms, { status: 200 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
