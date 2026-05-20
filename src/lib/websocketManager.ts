import { WebSocket } from 'ws';

interface Connection {
  client: WebSocket;
  roomId: number;
  userId?: number;
  role: 'participant' | 'moderator';
}

class WebSocketManager {
  private _connections: Connection[] = [];

  get connections(): Connection[] {
    return this._connections;
  }

  setConnections(connections: Connection[]): void {
    this._connections = connections;
  }

  addConnection(client: WebSocket, roomId: number, userId?: number, role: 'participant' | 'moderator' = 'participant'): void {
    this._connections.push({ client, roomId, userId, role });
    
    // Remove connection when client disconnects
    client.on('close', () => {
      this.removeConnection(client);
    });
  }

  removeConnection(client: WebSocket): void {
    this._connections = this._connections.filter(conn => conn.client !== client);
  }

  getConnectionsByRoom(roomId: number): Connection[] {
    return this._connections.filter(conn => conn.roomId === roomId);
  }

  getConnectionByUserId(userId: number): Connection | undefined {
    return this._connections.find(conn => conn.userId === userId);
  }

  broadcastToRoom(roomId: number, message: any, role?: 'participant' | 'moderator'): void {
    const messageStr = JSON.stringify(message);
    
    this._connections
      .filter(conn => conn.roomId === roomId && (!role || conn.role === role))
      .forEach(conn => {
        if (conn.client.readyState === WebSocket.OPEN) {
          conn.client.send(messageStr);
        }
      });
  }

  sendToUser(userId: number, message: any): boolean {
    const conn = this.getConnectionByUserId(userId);
    if (conn && conn.client.readyState === WebSocket.OPEN) {
      conn.client.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  broadcastQuestionReleased(roomId: number, question: any): void {
    this.broadcastToRoom(roomId, {
      type: 'questionReleased',
      data: question
    });
  }

  broadcastAnswerSubmitted(roomId: number, participantId: number, questionId: number, isCorrect: boolean, score: number): void {
    this.broadcastToRoom(roomId, {
      type: 'answerSubmitted',
      data: { participantId, questionId, isCorrect, score }
    }, 'moderator');
  }

  broadcastLeaderboardUpdate(roomId: number, leaderboard: any): void {
    this.broadcastToRoom(roomId, {
      type: 'leaderboardUpdate',
      data: leaderboard
    });
  }

  broadcastQuizEnd(roomId: number): void {
    this.broadcastToRoom(roomId, {
      type: 'quizEnd'
    });
  }
}

// Create singleton instance
const wsManager = new WebSocketManager();

// Use global to share across server.js and API routes in dev mode
declare global {
  var wsManagerGlobal: typeof wsManager | undefined;
}

if (global.wsManagerGlobal) {
  // If server.js has set a global wsManager, merge or replace
  const serverWsManager = global.wsManagerGlobal;
  
  // Copy connections from server.js wsManager
  if (serverWsManager.connections) {
    wsManager.setConnections(serverWsManager.connections);
  }
}

// Export for use in API routes
export { wsManager };

// Also export as global for sharing with server.js
export const wsManagerGlobal = wsManager;
