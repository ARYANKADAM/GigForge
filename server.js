const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // Store io instance globally for API routes
  global.io = io;

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join a chat room
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Leave a chat room
    socket.on("leave_room", (roomId) => {
      socket.leave(roomId);
    });

    // Handle sending messages
    socket.on("send_message", (data) => {
      // Broadcast to everyone in the room except sender
      socket.to(data.roomId).emit("receive_message", data);
    });

    // Typing indicators
    socket.on("typing_start", (data) => {
      socket.to(data.roomId).emit("user_typing", { userId: data.userId });
    });

    socket.on("typing_stop", (data) => {
      socket.to(data.roomId).emit("user_stop_typing", { userId: data.userId });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
