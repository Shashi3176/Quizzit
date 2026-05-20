import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDataFromToken } from '@/helpers/getDataFromToken';



export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const roomId = parseInt(params.id);
  
  // Verify user is host or moderator
  const userIdFromToken = await getDataFromToken(request);
  if (!userIdFromToken) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }
  
  const room = await prisma.quizRoom.findUnique({
    where: { id: roomId },
    select: { 
      hostId: true,
      moderators: { select: { id: true } }
    }
  });
  
  if (!room) {
    return NextResponse.json({ error: "Quiz room not found" }, { status: 404 });
  }
  
  const isHost = String(userIdFromToken) === String(room.hostId);
  const isModerator = room.moderators.some(mod => String(mod.id) === String(userIdFromToken));
  
  if (!isHost && !isModerator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  // Set up SSE response
  const response = new ReadableStream({
    start(controller) {
      // Send initial event
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected', data: { roomId, message: 'SSE connection established' } })}\n\n`);
      
      // Set up interval to send heartbeats to keep connection alive
      const heartbeatInterval = setInterval(() => {
        controller.enqueue(`data: ${JSON.stringify({ type: 'heartbeat', data: { timestamp: Date.now() } })}\n\n`);
      }, 30000); // Send every 30 seconds
      
      // Cleanup
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        controller.close();
      });
    }
  });
  
  return new NextResponse(response, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
