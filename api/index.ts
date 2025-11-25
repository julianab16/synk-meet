import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import meetRoutes from "./routes/meet.routes";

// Cargar variables de entorno
dotenv.config();

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check
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

// Puerto desde variable de entorno
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Meet service running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || '*'}`);
});