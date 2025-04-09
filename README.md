# LOL Champion Select - Socket.IO Server

This is the WebSocket server for the LOL Champion Select application. It handles real-time communication between clients during the champion selection process.

## Features

- Real-time champion selection updates
- Draft room management
- Team ready status synchronization
- WebSocket with fallback to polling

## Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The server will run on port 3001 by default.

## Production

The server is designed to be deployed on Railway. It will automatically use the PORT environment variable provided by the platform.

## Environment Variables

- `PORT` - The port to run the server on (default: 3001)
- `NODE_ENV` - The environment to run in ('development' or 'production')

## API

The server uses Socket.IO for real-time communication. Here are the available events:

### Client -> Server

- `join:draft` - Join a draft room
- `draft:init` - Initialize a new draft
- `champion:select` - Select a champion
- `champion:ban` - Ban a champion
- `team:ready` - Update team ready status

### Server -> Client

- `draft:initialized` - Draft has been initialized
- `champion:selected` - A champion has been selected
- `champion:banned` - A champion has been banned
- `team:status_updated` - Team ready status has changed
- `draft:starting` - Draft is starting (when both teams are ready)
