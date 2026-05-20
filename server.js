const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const rooms = new Map();

// Expose rooms Map globally for guessItWsManager (API route broadcasts)
global.guessItRoomsGlobal = rooms;

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Use same port for WebSocket as the main server (fixes Render deployment issue)
  // Render only exposes a single port per service
  const wsPort = dev ? parseInt(process.env.WS_PORT || '3001', 10) : port;
  
  const wss = new WebSocketServer({ noServer: true });

  // In production: Handle WebSocket upgrades on the same HTTP server
  // In dev: Let Next.js handle its own HMR, use separate WS server
  if (!dev) {
    server.on('upgrade', (req, socket, head) => {
      const { pathname } = parse(req.url, true);

      if (pathname.startsWith('/api/quiz-room/') && pathname.endsWith('/ws') ||
          pathname.startsWith('/api/guess-it-room/') && pathname.endsWith('/ws') ||
          pathname.startsWith('/api/the-100/') && pathname.endsWith('/ws') ||
          pathname.startsWith('/api/type-it-room/') && pathname.endsWith('/ws')) {
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit('connection', ws, req);
        });
      } else {
        socket.destroy();
      }
    });
  }

  server.listen(port, () => {
    console.log(`> Next.js server ready on http://${hostname}:${port}`);
    if (!dev) {
      console.log(`> WebSocket server sharing port ${port}`);
    }
  });

  // WebSocket connection handler on the wss object
  wss.on('connection', (ws, req) => {
    const { pathname } = parse(req.url, true);

    if (pathname.startsWith('/api/quiz-room/') && pathname.endsWith('/ws')) {
      const roomId = `quiz-${pathname.split('/')[3]}`;
      console.log(`Accepting WebSocket connection for room: ${roomId}`);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(ws);

      console.log(`Client connected to room ${roomId}. Total clients: ${rooms.get(roomId).size}`);

      ws.on('message', async (message) => {
        console.log('Quiz WS Received:', message.toString());
        
        try {
          const data = JSON.parse(message);

          if (data.type === 'releaseQuestion') {
            const questionId = data.questionId;
            const fetchQuestion = await fetch(`http://localhost:${port}/api/quiz-room/${roomId.replace('quiz-', '')}/questions/${questionId}`);
            const question = await fetchQuestion.json();

            const broadcastMsg = JSON.stringify({
              type: 'questionReleased',
              data: question
            });

            rooms.get(roomId)?.forEach(client => {
              if (client.readyState === 1) {
                client.send(broadcastMsg);
              }
            });
            console.log(`Broadcast question ${questionId} to room ${roomId}`);

            // Update currentQuestion in DB so polling clients (leaderboard) stay in sync
            try {
              await fetch(`http://localhost:${port}/api/quiz-room/${roomId.replace('quiz-', '')}/set-current-question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionOrder: question.order || questionId })
              });
              console.log(`Updated currentQuestion to ${question.order || questionId} in DB for room ${roomId}`);
            } catch (dbErr) {
              console.error('Failed to update currentQuestion in DB:', dbErr);
            }
          }
        } catch (e) {
          console.error('Error processing message:', e);
        }
      });

      ws.on('close', () => {
        rooms.get(roomId)?.delete(ws);
        console.log(`Client disconnected from room ${roomId}`);
      });

      ws.on('error', (error) => {
        console.error('Quiz WebSocket error:', error);
      });

      ws.send(JSON.stringify({ type: 'connected', message: 'Welcome to quiz room' }));
    } else if (pathname.startsWith('/api/guess-it-room/') && pathname.endsWith('/ws')) {
      const roomId = `guess-${pathname.split('/')[3]}`;
      console.log(`Accepting WebSocket connection for guess-it room: ${roomId}`);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(ws);

      console.log(`Client connected to guess-it room ${roomId}. Total clients: ${rooms.get(roomId).size}`);

      ws.on('message', async (message) => {
        console.log('GuessIt WS Received:', message.toString());
        
        try {
          const data = JSON.parse(message);

          if (data.type === 'releaseGuessItQuestion') {
            const questionId = data.questionId;
            const fetchQuestion = await fetch(`http://localhost:${port}/api/guess-it-room/${roomId.replace('guess-', '')}/questions/${questionId}`);
            const question = await fetchQuestion.json();

            const broadcastMsg = JSON.stringify({
              type: 'guessItQuestionReleased',
              data: question
            });

            rooms.get(roomId)?.forEach(client => {
              if (client.readyState === 1) {
                client.send(broadcastMsg);
              }
            });
            console.log(`Broadcast question ${questionId} to guess-it room ${roomId}`);

            try {
              await fetch(`http://localhost:${port}/api/guess-it-room/${roomId.replace('guess-', '')}/set-current-question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionOrder: question.order || questionId })
              });
              console.log(`Updated currentQuestion to ${question.order || questionId} in DB for guess-it room ${roomId}`);
            } catch (dbErr) {
              console.error('Failed to update currentQuestion in DB:', dbErr);
            }
          } else if (data.type === 'endGuessItQuestion') {
            const broadcastMsg = JSON.stringify({
              type: 'guessItQuestionEnded'
            });

            rooms.get(roomId)?.forEach(client => {
              if (client.readyState === 1) {
                client.send(broadcastMsg);
              }
            });
            console.log(`Broadcast question ended to guess-it room ${roomId}`);
          } else if (data.type === 'releaseGuessItHint') {
            const { questionId, hintIndex } = data;
            const fetchQuestion = await fetch(`http://localhost:${port}/api/guess-it-room/${roomId.replace('guess-', '')}/questions/${questionId}`);
            const question = await fetchQuestion.json();

            const hints = question.hints || [];
            const hint = hints[hintIndex];

            if (hint) {
              const broadcastMsg = JSON.stringify({
                type: 'guessItHintReleased',
                data: { questionId, hintIndex, hint }
              });

              rooms.get(roomId)?.forEach(client => {
                if (client.readyState === 1) {
                  client.send(broadcastMsg);
                }
              });
              console.log(`Broadcast hint ${hintIndex} for question ${questionId} to guess-it room ${roomId}`);
            }
          }
        } catch (e) {
          console.error('Error processing guess-it message:', e);
        }
      });

      ws.on('close', () => {
        rooms.get(roomId)?.delete(ws);
        console.log(`Client disconnected from guess-it room ${roomId}`);
      });

      ws.on('error', (error) => {
        console.error('GuessIt WebSocket error:', error);
      });

      ws.send(JSON.stringify({ type: 'guessItConnected', message: 'Welcome to guess-it room' }));
    } else if (pathname.startsWith('/api/the-100/') && pathname.endsWith('/ws')) {
      const roomId = `the100-${pathname.split('/')[3]}`;
      console.log(`Accepting WebSocket connection for the-100 room: ${roomId}`);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(ws);

      console.log(`Client connected to the-100 room ${roomId}. Total clients: ${rooms.get(roomId).size}`);

      ws.on('message', async (message) => {
        console.log('The100 WS Received:', message.toString());
        
        try {
          const data = JSON.parse(message);

          if (data.type === 'releaseThe100Question') {
            const questionId = data.questionId;
            const fetchQuestion = await fetch(`http://localhost:${port}/api/the-100/${roomId.replace('the100-', '')}/questions/${questionId}`);
            const question = await fetchQuestion.json();

            const broadcastMsg = JSON.stringify({
              type: 'the100QuestionReleased',
              data: question
            });

            rooms.get(roomId)?.forEach(client => {
              if (client.readyState === 1) {
                client.send(broadcastMsg);
              }
            });
            console.log(`Broadcast question ${questionId} to the-100 room ${roomId}`);

            try {
              await fetch(`http://localhost:${port}/api/the-100/${roomId.replace('the100-', '')}/set-current-question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionOrder: question.order || questionId })
              });
              console.log(`Updated currentQuestion to ${question.order || questionId} in DB for the-100 room ${roomId}`);
            } catch (dbErr) {
              console.error('Failed to update currentQuestion in DB:', dbErr);
            }
          } else if (data.type === 'endThe100Question') {
            const broadcastMsg = JSON.stringify({
              type: 'the100QuestionEnded'
            });

            rooms.get(roomId)?.forEach(client => {
              if (client.readyState === 1) {
                client.send(broadcastMsg);
              }
            });
            console.log(`Broadcast question ended to the-100 room ${roomId}`);
          }
        } catch (e) {
          console.error('Error processing the-100 message:', e);
        }
      });

      ws.on('close', () => {
        rooms.get(roomId)?.delete(ws);
        console.log(`Client disconnected from the-100 room ${roomId}`);
      });

      ws.on('error', (error) => {
        console.error('The100 WebSocket error:', error);
      });

      ws.send(JSON.stringify({ type: 'the100Connected', message: 'Welcome to The-100 room' }));
    } else if (pathname.startsWith('/api/type-it-room/') && pathname.endsWith('/ws')) {
      const roomId = `typeit-${pathname.split('/')[3]}`;
      console.log(`Accepting WebSocket connection for type-it room: ${roomId}`);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(ws);

      console.log(`Client connected to type-it room ${roomId}. Total clients: ${rooms.get(roomId).size}`);

      ws.on('message', async (message) => {
        console.log('TypeIt WS Received:', message.toString());
        
        try {
          const data = JSON.parse(message);

          if (data.type === 'releaseTypeItQuestion') {
            const questionId = data.questionId;
            const fetchQuestion = await fetch(`http://localhost:${port}/api/type-it-room/${roomId.replace('typeit-', '')}/questions/${questionId}`);
            const question = await fetchQuestion.json();

            const broadcastMsg = JSON.stringify({
              type: 'typeItQuestionReleased',
              data: question
            });

            rooms.get(roomId)?.forEach(client => {
              if (client.readyState === 1) {
                client.send(broadcastMsg);
              }
            });
            console.log(`Broadcast question ${questionId} to type-it room ${roomId}`);

            try {
              await fetch(`http://localhost:${port}/api/type-it-room/${roomId.replace('typeit-', '')}/set-current-question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionOrder: question.order || questionId })
              });
              console.log(`Updated currentQuestion to ${question.order || questionId} in DB for type-it room ${roomId}`);
            } catch (dbErr) {
              console.error('Failed to update currentQuestion in DB:', dbErr);
            }
          }
        } catch (e) {
          console.error('Error processing type-it message:', e);
        }
      });

      ws.on('close', () => {
        rooms.get(roomId)?.delete(ws);
        console.log(`Client disconnected from type-it room ${roomId}`);
      });

      ws.on('error', (error) => {
        console.error('TypeIt WebSocket error:', error);
      });

      ws.send(JSON.stringify({ type: 'typeItConnected', message: 'Welcome to TypeIt room' }));
    }
  });

  // Only create separate wsServer for development with its own upgrade handler
  if (dev) {
    const wsServer = createServer();
    wsServer.on('upgrade', (req, socket, head) => {
      const { pathname } = parse(req.url, true);

      if (pathname.startsWith('/api/quiz-room/') && pathname.endsWith('/ws') ||
          pathname.startsWith('/api/guess-it-room/') && pathname.endsWith('/ws') ||
          pathname.startsWith('/api/the-100/') && pathname.endsWith('/ws') ||
          pathname.startsWith('/api/type-it-room/') && pathname.endsWith('/ws')) {
        wss.handleUpgrade(req, socket, head, (ws) => {
          wss.emit('connection', ws, req);
        });
      } else {
        socket.destroy();
      }
    });
    wsServer.listen(wsPort, () => {
      console.log(`> WebSocket server ready on port ${wsPort}`);
    });
  }
});
