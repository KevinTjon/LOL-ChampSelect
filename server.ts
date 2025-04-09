import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Store active drafts
const activeDrafts = new Map();

// Add a health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

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

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
}); 