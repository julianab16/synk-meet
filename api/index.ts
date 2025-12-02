import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { ExpressPeerServer } from "peer";
import meetRoutes from "./routes/meet.routes";
/**
 * Main Application Entry Point
 * 
 * Initializes and configures the Express server for the Meet Service.
 * Sets up middleware, routes, and starts the HTTP server.
 * 
 * @module index
 */

/**
 * Load environment variables from .env file.
 * Must be called before accessing process.env variables.
 * 
 * @see {@link https://www.npmjs.com/package/dotenv|dotenv documentation}
 */
dotenv.config();

/**
 * Express application instance.
 * Main server application that handles all HTTP requests.
 * 
 * @type {express.Application}
 */
const app = express();
const server = createServer(app);

/**
 * CORS (Cross-Origin Resource Sharing) configuration.
 * Controls which domains can access the API.
 * 
 * @type {Object}
 * @property {string} origin - Allowed origin(s) for cross-origin requests
 *                            Defaults to "*" (all origins) if CORS_ORIGIN not set
 * @property {boolean} credentials - Allow credentials (cookies, authorization headers)
 * 
 * @see {@link https://www.npmjs.com/package/cors|CORS documentation}
 */
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

/**
 * Health check endpoint.
 * Used for monitoring server status and availability.
 * 
 * @route GET /health
 * @returns {Object} 200 - Server health status
 * @returns {string} 200.status - Always "OK" when server is running
 * @returns {string} 200.service - Service name identifier
 * @returns {string} 200.env - Current environment (development/production)
 * 
 * @example
 * // GET /health
 * // Response:
 * {
 *   "status": "OK",
 *   "service": "meet-service",
 *   "env": "development"
 * }
 */
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    service: "meet-service",
    env: process.env.NODE_ENV 
  });
});

app.use("/meet", meetRoutes);

// Manejo de rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

/**
 * Server port configuration.
 * Can be set via PORT environment variable, defaults to 4000.
 * 
 * @type {number}
 * @constant
 */
const PORT = process.env.PORT || 4000;


/** -------------- WEBSOCKETS & PEERS ---------------- */


/**
 * Peer management for WebRTC connections.
 * Stores active peer connections and their metadata.
 */
interface PeerInfo {
  socketId: string;
  peerId?: string;
  meetingId?: string;
  userId?: string;
  mediaEnabled: {
    audio: boolean;
    video: boolean;
  };
}

let peers: { [socketId: string]: PeerInfo } = {};

/**
 * Socket.IO server instance for real-time communication.
 * Handles WebRTC signaling and peer management.
 */
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"]
  }
});

/**
 * PeerJS server for WebRTC peer-to-peer connections.
 * Handles ICE candidate exchange and media streaming.
 */
const peerServer = ExpressPeerServer(server, {
  path: '/peerjs',
  proxied: true
});


/**
 * Mount PeerJS server at /peerjs endpoint.
 * Clients connect to this for WebRTC functionality.
 */
app.use('/peerjs', peerServer);

/**
 * Limpieza automática: elimina sockets huérfanos
 */
setInterval(() => {
  const now = Date.now();
  for (const id in peers) {
    const socket = io.sockets.sockets.get(id);

    // Si no existe el socket → limpiarlo
    if (!socket) {
      console.log("🧹 Cleaning ghost peer:", id);
      delete peers[id];
      continue;
    }
  }
}, 30000); // cada 30 segundos




/**
 * Socket.IO connection handler for real-time signaling.
 * Manages peer discovery, WebRTC signaling, and media control.
 */
io.on("connection", (socket) => {
  console.log(`📞 Socket connected: ${socket.id}`);

  // 👉 Esto sí es válido: evento de desconexión DEL SOCKET
  socket.on("disconnect", () => {
    const info = peers[socket.id];

    if (info?.meetingId) {
      socket.to(info.meetingId).emit("user-left", {
        socketId: socket.id,
        userId: info.userId,
        peerId: info.peerId,
      });
    }
    delete peers[socket.id];
    console.log(`📴 User disconnected: ${socket.id}`);
  });

  /**
   * Handle user joining a meeting room.
   * Associates socket with meeting and initializes peer info.
   */
  socket.on("join-meeting", (data: { meetingId: string; userId: string; peerId: string }) => {
    const { meetingId, userId, peerId } = data;
    
    // Initialize peer info
    peers[socket.id] = {
      socketId: socket.id,
      peerId,
      meetingId,
      userId,
      mediaEnabled: { audio: true, video: false }
    };

    // Join meeting room
    socket.join(meetingId);
    
    // Notify existing peers about new user
    socket.to(meetingId).emit("user-joined", {
      userId,
      peerId,
      socketId: socket.id
    });

    // Send existing peers to new user
    const meetingPeers = Object.values(peers).filter(p => p.meetingId === meetingId && p.socketId !== socket.id).slice(0, 20);
    socket.emit("existing-peers", meetingPeers.map(p => ({
      userId: p.userId,
      peerId: p.peerId,
      socketId: p.socketId,
      mediaEnabled: p.mediaEnabled
    })));

    console.log(`🎯 User ${userId} joined meeting ${meetingId} with peer ${peerId}`);
  });

  /**
   * Handle WebRTC signaling data exchange.
   */
  socket.on("signal", (data: { to: string; from: string; signal: any }) => {
    const { to, from, signal } = data;
    socket.to(to).emit("signal", { from, signal });
  });

  /**
   * Handle audio toggle (mute/unmute).
   */
  socket.on("toggle-audio", (data: { enabled: boolean }) => {
    if (peers[socket.id]) {
      peers[socket.id].mediaEnabled.audio = data.enabled;
      
      // Notify meeting participants about audio state change
      if (peers[socket.id].meetingId) {
        socket.to(peers[socket.id].meetingId!).emit("peer-audio-toggle", {
          socketId: socket.id,
          userId: peers[socket.id].userId,
          audioEnabled: data.enabled
        });
      }
    }
  });

  /**
   * Handle video toggle (camera on/off).
   */
  socket.on("toggle-video", (data: { enabled: boolean }) => {
    if (peers[socket.id]) {
      peers[socket.id].mediaEnabled.video = data.enabled;
      
      // Notify meeting participants about video state change
      if (peers[socket.id].meetingId) {
        socket.to(peers[socket.id].meetingId!).emit("peer-video-toggle", {
          socketId: socket.id,
          userId: peers[socket.id].userId,
          videoEnabled: data.enabled
        });
      }
    }
  });

  /**
   * Handle peer disconnection.
   */
  socket.on("disconnect", () => {
    const peerInfo = peers[socket.id];
    if (peerInfo) {
      // Notify meeting participants about user leaving
      if (peerInfo.meetingId) {
        socket.to(peerInfo.meetingId).emit("user-left", {
          socketId: socket.id,
          userId: peerInfo.userId,
          peerId: peerInfo.peerId
        });
      }
      
      delete peers[socket.id];
      console.log(`📴 User disconnected: ${socket.id}`);
    }
  });
});

/**
 * Start the HTTP server and listen for incoming connections.
 * Logs server startup information to console.
 * 
 * @listens {number} PORT - The port number the server listens on
 */
server.listen(PORT, () => {
  console.log(`🚀 Meet service running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || '*'}`);
  console.log(`🎥 PeerJS server available at /peerjs`);
});