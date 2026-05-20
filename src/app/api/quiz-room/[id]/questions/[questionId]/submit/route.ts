
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../../lib/prisma';
import { getDataFromToken } from '@/helpers/getDataFromToken';
import { wsManager } from '@/lib/websocketManager';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id: quizRoomId, questionId } = await context.params;
    const reqBody = await request.json();
    const { answer, responseTime } = reqBody;

    const user = await getDataFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

     // Get user details from userId
     const userDetails = await prisma.user.findUnique({
       where: { id: parseInt(user) },
       select: { id: true, username: true }
     });

     if (!userDetails) {
       return NextResponse.json({ error: 'User not found' }, { status: 404 });
     }

     const participant = await prisma.participant.findFirst({
        where: {
            name: userDetails.username, // Assuming participant name is unique for the room
            quizRoomId: parseInt(quizRoomId),
        }
    });

    if (!participant) {
        return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    const question = await prisma.question.findUnique({
      where: { id: parseInt(questionId) },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const isCorrect = JSON.stringify(answer) === JSON.stringify(question.correctAnswer);
    const score = isCorrect ? question.points : 0;

    await prisma.participantAnswer.create({
      data: {
        participantId: participant.id,
        questionId: parseInt(questionId),
        answer: answer,
        isCorrect: isCorrect,
        responseTime: responseTime,
        score: score,
      },
    });

    await prisma.participant.update({
      where: { id: participant.id },
      data: {
        score: {
          increment: score,
        },
      },
    });

     // Update ranks
     const allParticipants = await prisma.participant.findMany({
       where: { quizRoomId: parseInt(quizRoomId) },
       orderBy: { score: 'desc' },
     });

     const rankUpdates = allParticipants.map((p, index) => {
         return prisma.participant.update({
             where: { id: p.id },
             data: { rank: index + 1 },
         });
     });

     await prisma.$transaction(rankUpdates);

     // Broadcast answer submission to moderators
     wsManager.broadcastAnswerSubmitted(
       parseInt(quizRoomId), 
       participant.id, 
       parseInt(questionId), 
       isCorrect, 
       score
     );

     // Get updated leaderboard and broadcast to all participants
     const updatedLeaderboard = await prisma.participant.findMany({
       where: { quizRoomId: parseInt(quizRoomId) },
       select: { id: true, name: true, score: true, rank: true },
       orderBy: { rank: 'asc' },
     });

     wsManager.broadcastLeaderboardUpdate(parseInt(quizRoomId), updatedLeaderboard);

     return NextResponse.json({
       message: 'Answer submitted successfully',
       isCorrect,
       score,
     });
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
