import express from "express";
import meetRoutes from "./routes/meet.routes";

const app = express();
app.use(express.json());

app.use("/meet", meetRoutes);

app.listen(4000, () => console.log("Meet service running on port 4000"));
