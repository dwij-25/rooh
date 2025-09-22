import express from "express";
import { Server } from "socket.io";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3500;

app.use(express.static(path.join(__dirname, "public")));

let therapists = [];
let bookings = [];

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("createRoom", ({ name, room, time }) => {
    therapists.push({ name, room, time });
    io.emit("therapistList", therapists);
  });

  socket.on("getTherapists", () => {
    socket.emit("therapistList", therapists);
  });

  socket.on("bookTherapist", ({ student, room }) => {
    bookings.push({ student, room });
    socket.emit("bookingConfirmed", { student, room });
    console.log("Bookings:", bookings);
  });

  socket.on("joinRoom", ({ room, role }) => {
    socket.join(room);
    socket.to(room).emit("message", { user: "System", msg: `${role} joined the room.` });
  });

  socket.on("chatMessage", ({ room, msg }) => {
    io.to(room).emit("message", { user: "User", msg });
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
