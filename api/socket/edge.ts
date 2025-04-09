import { Server } from 'socket.io';
import { createServer } from 'http';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

const io = new Server({
  path: '/api/socket.io',
  cors: {
    origin: process.env.ALLOWED_ORIGINS ? 
      process.env.ALLOWED_ORIGINS.split(',') : 
      ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Store active drafts
const activeDrafts = new Map();

// Handle socket connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle joining draft rooms
  socket.on('join:draft', ({ draftId }) => {
    socket.join(`draft:${draftId}`);
    console.log(`Client ${socket.id} joined draft ${draftId}`);
  });

  // Handle draft initialization
  socket.on('draft:init', ({ draftInfo, status }) => {
    const draftId = draftInfo.draftId;
    activeDrafts.set(draftId, { draftInfo, status });
    
    // Broadcast to all clients in the draft room
    io.to(`draft:${draftId}`).emit('draft:initialized', { draftInfo, status });
    console.log(`Draft ${draftId} initialized`);
  });

  // Handle champion selection
  socket.on('champion:select', (data) => {
    const { draftId, ...selectionData } = data;
    socket.to(`draft:${draftId}`).emit('champion:selected', selectionData);
  });

  // Handle champion banning
  socket.on('champion:ban', (data) => {
    const { draftId, ...banData } = data;
    socket.to(`draft:${draftId}`).emit('champion:banned', banData);
  });

  // Handle team ready status
  socket.on('team:ready', ({ draftId, team, isReady }) => {
    const draft = activeDrafts.get(draftId);
    if (draft) {
      if (team === 'blue') {
        draft.status.blueTeamReady = isReady;
      } else if (team === 'red') {
        draft.status.redTeamReady = isReady;
      }
      
      // Check if both teams are ready
      if (draft.status.blueTeamReady && draft.status.redTeamReady) {
        draft.status.isStarting = true;
        io.to(`draft:${draftId}`).emit('draft:starting', draft);
      }
      
      io.to(`draft:${draftId}`).emit('team:status_updated', draft.status);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

export default async function handler(req: NextRequest) {
  if (req.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 426 });
  }

  const { socket: ws, response } = Deno.upgradeWebSocket(req);
  
  // Attach the WebSocket to Socket.IO
  io.engine.attach(ws);

  return response;
} 