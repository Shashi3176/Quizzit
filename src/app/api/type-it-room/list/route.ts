import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "../../auth/verifyToken/route";

export async function GET(req: NextRequest) {
    const verificationResult = await verifyToken(req);

    const data  = await verificationResult.json();
    const userId = data.data.decoded.userId;
    
    try {
        const rooms = await prisma.typeItRoom.findMany({
            where: { hostId: userId },
            include: {
                questions: { orderBy: { order: 'asc' } },
                moderators: true,
            },
        });

        return NextResponse.json(rooms, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch user's type-it rooms:", error);
        return NextResponse.json({ message: "Failed to fetch user's type-it rooms" }, { status: 500 });
    }
}
