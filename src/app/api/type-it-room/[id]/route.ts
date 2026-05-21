import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { verifyToken } from "../../auth/verifyToken/route";

async function checkAuthorization(req: NextRequest, roomId: number) {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
        return NextResponse.json({ message: "Unauthorized - No token" }, { status: 401 });
    }
    
    const verificationResult = await verifyToken(req);
    
    if (!verificationResult.ok) {
        return NextResponse.json({ message: "Unauthorized - Invalid token" }, { status: 401 });
    }
    
    const data = await verificationResult.json();
    
    if (!data?.data?.decoded?.userId) {
        return NextResponse.json({ message: "Unauthorized - Invalid token structure" }, { status: 401 });
    }
    
    const userId = data.data.decoded.userId;

    const room = await prisma.typeItRoom.findUnique({
        where: { id: roomId },
        select: { 
            hostId: true,
            moderators: {
                select: { id: true }
            },
            participants: {
                select: { userId: true, name: true }
            }
        }
    });

    if (!room) {
        return NextResponse.json({ message: "TypeIt room not found" }, { status: 404 });
    }

    const userIdNum = Number(userId);
    const hostIdNum = Number(room.hostId);
    
    const isHost = hostIdNum === userIdNum;
    const isModerator = room.moderators.some(mod => Number(mod.id) === userIdNum);
    const isParticipant = room.participants.some(p => String(p.userId) === String(userId));

    if (isHost || isModerator || isParticipant) {
        return null;
    }
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const params = await context.params;
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
        return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
    }

    const authError = await checkAuthorization(req, id);
    if (authError) return authError;

    try {
        const room = await prisma.typeItRoom.findUnique({
            where: { id },
            include: { 
                questions: { orderBy: { order: 'asc' } },
                moderators: true,
                participants: true
            },
        });

        if (!room) {
            return NextResponse.json({ message: "TypeIt room not found" }, { status: 404 });
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { user_password: _user_password, mod_password: _mod_password, ...roomDetails } = room;
        return NextResponse.json(roomDetails, { status: 200 });
    } catch (error) {
        let errorMessage = "An unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const params = await context.params;
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
        return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
    }

    const authError = await checkAuthorization(req, id);
    if (authError) return authError;

    try {
        const { title, desc, user_password, mod_password, moderators } = await req.json();
        const updatedRoom = await prisma.typeItRoom.update({
            where: { id },
            data: { 
                title, 
                desc, 
                user_password, 
                mod_password,
                moderators: {
                    set: moderators ? moderators.map((mod: { id: number }) => ({ id: mod.id })) : []
                }
            },
        });
        return NextResponse.json(updatedRoom, { status: 200 });
    } catch (error) {
        let errorMessage = "An unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const params = await context.params;
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
        return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
    }

    const authError = await checkAuthorization(req, id);
    if (authError) return authError;

    try {
        await prisma.typeItRoom.delete({ where: { id } });
        return NextResponse.json({ message: "TypeIt room deleted" }, { status: 200 });
    } catch (error) {
        let errorMessage = "An unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
