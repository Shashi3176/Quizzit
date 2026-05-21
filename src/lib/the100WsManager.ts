declare global {
  var the100RoomsGlobal: Map<string, Set<any>> | undefined;
}

function getRooms(): Map<string, Set<any>> {
  if (!global.guessItRoomsGlobal) {
    global.guessItRoomsGlobal = new Map();
  }
  return global.guessItRoomsGlobal;
}

function broadcastToRoom(roomId: number, message: any): void {
  const rooms = getRooms();
  const roomKey = `the100-${roomId}`;
  const clients = rooms.get(roomKey);
  if (!clients) return;

  const messageStr = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(messageStr);
    }
  });
}

export function broadcastThe100QuestionReleased(roomId: number, question: any): void {
  broadcastToRoom(roomId, {
    type: 'the100QuestionReleased',
    data: question
  });
}

export function broadcastThe100AnswerSubmitted(roomId: number, data: { participantId: number; participantName: string; answerId: number; answer: string; questionId: number }): void {
  broadcastToRoom(roomId, {
    type: 'the100AnswerSubmitted',
    data
  });
}

export function broadcastThe100AnswerReviewed(roomId: number, data: { participantId: number; participantName: string; answerId: number; status: string; score: number; questionId: number }): void {
  broadcastToRoom(roomId, {
    type: 'the100AnswerReviewed',
    data
  });
}

export function broadcastThe100LeaderboardUpdate(roomId: number, leaderboard: any): void {
  broadcastToRoom(roomId, {
    type: 'the100LeaderboardUpdate',
    data: leaderboard
  });
}

export function broadcastThe100QuestionEnded(roomId: number): void {
  broadcastToRoom(roomId, {
    type: 'the100QuestionEnded'
  });
}

export function broadcastThe100QuizEnd(roomId: number): void {
  broadcastToRoom(roomId, {
    type: 'the100QuizEnd'
  });
}
