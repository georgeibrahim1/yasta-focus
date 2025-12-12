import env from 'dotenv';
env.config({ path:"./config.env"});

import { createServer } from 'http';
import app from './app.js';
import './db.js';
import { initializeSocket } from './socket/socketServer.js';

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.io
initializeSocket(server);

server.listen(PORT,()=> {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.io initialized`);
});



