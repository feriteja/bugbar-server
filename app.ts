import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);

// Configure CORS for Socket.IO
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("join", (room, ack) => {
    socket.join(room);
    ack(`you've joined room ${room}`);
  });
});

// Apply CORS middleware for Express
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  return res.status(200).json({ message: "thanks for connect" });
});

// Express route for webhook
app.get("/webhook", (req: Request, res: Response) => {
  // Assuming user ID is sent as a query parameter
  const orderId = req.query.orderId as string; // Make sure to validate and sanitize the input
  if (!orderId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  // Emit a socket.io event to the specific user
  // io.emit("webhook", { message: "Webhook received!" });
  io.to(orderId).emit("webhook", { message: "Webhook received!" });

  return res.status(200).json({ success: true });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
