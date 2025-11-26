import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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

/**
 * Start the HTTP server and listen for incoming connections.
 * Logs server startup information to console.
 * 
 * @listens {number} PORT - The port number the server listens on
 */
app.listen(PORT, () => {
  console.log(`🚀 Meet service running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || '*'}`);
});