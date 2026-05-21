import { getDataFromToken } from "@/helpers/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const hostId = await getDataFromToken(req);
    const nHostId = Number(hostId);
    if (!hostId) {
        return NextResponse.json({ message: "Authentication failed. Please log in to create a type-it room." }, { status: 401 });
    }

    const { title, desc, user_password, mod_password } = await req.json();

    const newRoom = await prisma.typeItRoom.create({
      data: {
        hostId: nHostId,
        title,
        desc,
        user_password,
        mod_password,
      },
    });
    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const hostId = await getDataFromToken(req);
    const nHostId = Number(hostId);
    if (!hostId) {
        return NextResponse.json({ message: "Authentication failed. Please log in to view your type-it rooms." }, { status: 401 });
    }

    const rooms = await prisma.typeItRoom.findMany({ where: { hostId: nHostId } });
    return NextResponse.json(rooms, { status: 200 });
  } catch (error) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
