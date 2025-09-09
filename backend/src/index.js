import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/messageRoutes.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; // enables you to grab token from cookie
import cors from "cors"; // Cross-Origin Resource Sharing -> browsers block requests from one origin to another for safety / in our case front and back run on different ports -> prob needed in dev only

import { connectDB } from "./lib/db.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes); // routes that handle everything authentication related prefixed with /api/auth
app.use("/api/message", messageRoutes);

app.listen(PORT, () => {
  console.log("Server is running on port: " + PORT);
  connectDB();
});
