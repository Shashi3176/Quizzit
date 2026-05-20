/**
 * Guess-It WebSocket Manager
 * 
 * Separate from quiz-room wsManager. Uses distinct event names to avoid conflicts.
 * Bridges API route broadcasts to server.js's raw WebSocket rooms via global rooms Map.
 * 
 * Outbound events (server → client):
 *   - guessItQuestionReleased: When host releases a question
 *   - guessItHintReleased: When host releases a hint
 *   - guessItGuessSubmitted: When a participant submits a guess (to moderators)
 *   - guessItLeaderboardUpdate: When leaderboard changes
 *   - guessItQuizEnd: When quiz ends
 * 
 * Inbound events (client → server):
 *   - releaseGuessItQuestion: Host requests to release a question
 *   - releaseGuessItHint: Host requests to release a hint
 */

declare global {
  var guessItRoomsGlobal: Map<string, Set<any>> | undefined;
}

function getRooms(): Map<string, Set<any>> {
  if (!global.guessItRoomsGlobal) {
    global.guessItRoomsGlobal = new Map();
  }
  return global.guessItRoomsGlobal;
}

function broadcastToRoom(roomId: number, message: any): void {
  const rooms = getRooms();
  const roomKey = `guess-${roomId}`;
  const clients = rooms.get(roomKey);
  if (!clients) return;

  const messageStr = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(messageStr);
    }
  });
}

export function broadcastGuessItQuestionReleased(roomId: number, question: any): void {
  broadcastToRoom(roomId, {
    type: 'guessItQuestionReleased',
    data: question
  });
}

export function broadcastGuessItHintReleased(roomId: number, questionId: number, hintIndex: number, hint: string): void {
  broadcastToRoom(roomId, {
    type: 'guessItHintReleased',
    data: { questionId, hintIndex, hint }
  });
}

export function broadcastGuessItGuessSubmitted(roomId: number, participantId: number, questionId: number, isCorrect: boolean, score: number): void {
  broadcastToRoom(roomId, {
    type: 'guessItGuessSubmitted',
    data: { participantId, questionId, isCorrect, score }
  });
}

export function broadcastGuessItLeaderboardUpdate(roomId: number, leaderboard: any): void {
  broadcastToRoom(roomId, {
    type: 'guessItLeaderboardUpdate',
    data: leaderboard
  });
}

export function broadcastGuessItQuestionEnded(roomId: number): void {
  broadcastToRoom(roomId, {
    type: 'guessItQuestionEnded'
  });
}

export function broadcastGuessItQuizEnd(roomId: number): void {
  broadcastToRoom(roomId, {
    type: 'guessItQuizEnd'
  });
}
