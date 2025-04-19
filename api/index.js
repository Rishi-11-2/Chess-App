const express = require("express");
const { v4: uuid } = require("uuid");
const app = express();
const http = require("http");
const cors = require("cors");
require('dotenv').config();
const PORT = process.env.PORT || 8000;
const CLIENT_URL = process.env.CLIENT_URL || '*';

app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
app.options("*", cors({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
app.use(express.json());

const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.post("/data", (req, res) => {
  // console.log(req.body.user);
  res.send("hi");
});

app.get("/", (req, res) => {
  res.send("Chess API is running");
});

const rooms = new Map();
io.on("connection", (socket) => {
  console.log("socket connected", socket.id);
  socket.on("username", (username) => {
    // console.log(username);
    socket.data.username = username;
  });
  // Create room with timeControl
  socket.on("createRoom", async (timeControl, callback) => {
    const roomID = uuid();
    console.log("room creation", roomID);
    await socket.join(roomID);
    // Initialize room with timeControl
    rooms.set(roomID, {
      roomID,
      players: [{ id: socket.id, username: socket.data?.username, orientation: "white" }],
      timeControl
    });
    callback(roomID);
  });

  // Join room and emit opponent joined with timeControl
  socket.on("joinRoom", async (args, callback) => {
    const roomObj = rooms.get(args.roomID);
    if (!roomObj) return callback({ error: true, message: "Room not found" });
    if (roomObj.players.length >= 2) return callback({ error: true, message: "Room is full" });

    await socket.join(args.roomID);
    const newPlayer = { id: socket.id, username: socket.data?.username, orientation: "black" };
    const updatedPlayers = [...roomObj.players, newPlayer];
    const updatedRoom = { roomID: roomObj.roomID, players: updatedPlayers, timeControl: roomObj.timeControl };
    rooms.set(args.roomID, updatedRoom);
    // Send ack with players and timeControl
    callback({ players: updatedPlayers, timeControl: roomObj.timeControl });
    // Notify both players
    io.in(args.roomID).emit("opponent joined", { players: updatedPlayers, timeControl: roomObj.timeControl });
  });

  socket.on("move", (data) => {
    // Broadcast move along with timers for synchronization
    io.in(data.room).emit("move", data);
  });
  socket.on("resign", (roomID) => {
    const room = rooms.get(roomID);
    if (!room) return;
    const winnerPlayer = room.players.find(p => p.id !== socket.id);
    const winnerName = winnerPlayer?.username || "Opponent";
    io.in(roomID).emit("resign", { winner: winnerName });
    rooms.delete(roomID);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
