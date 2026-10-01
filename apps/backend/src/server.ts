import "dotenv/config";
import app from "./app";
import { createServer } from "http";
import { Server } from "socket.io";
const port = Number(process.env.PORT) || 5000;
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
