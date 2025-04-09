import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
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

// Add a health check endpoint
app.get('/api/socket/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
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

  // Handle leaving draft rooms
  socket.on('leave:draft', ({ draftId }) => {
    socket.leave(`draft:${draftId}`);
    console.log(`Client ${socket.id} left draft ${draftId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});

export default httpServer; 