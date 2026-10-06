import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-board", (boardId: string) => {
    socket.join(boardId);

    console.log(`Socket ${socket.id} joined board ${boardId}`);
  });

  socket.on("leave-board", (boardId: string) => {
    socket.leave(boardId);

    console.log(`Socket ${socket.id} left board ${boardId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO is not initialized");
  }

  return io;
};