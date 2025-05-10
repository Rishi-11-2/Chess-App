const { Server } = require("socket.io");
const { v4: uuid } = require("uuid");

const rooms = new Map();

module.exports = (server) => {
  const io = new Server(server, {
    cors: { origin: require("./../config").CLIENT_URL, methods: ["GET","POST"], credentials: true }
  });

  io.on("connection", (socket) => {
    console.log("socket connected", socket.id);

    socket.on("username", (username) => {
      socket.data.username = username;
    });

    socket.on("createRoom", async (timeControl, callback) => {
      const roomID = uuid();
      await socket.join(roomID);
      rooms.set(roomID, { roomID, players: [{ id: socket.id, username: socket.data.username, orientation: "white" }], timeControl });
      callback(roomID);
    });

    socket.on("joinRoom", async ({ roomID }, callback) => {
      const roomObj = rooms.get(roomID);
      if (!roomObj) return callback({ error: true, message: "Room not found" });
      if (roomObj.players.length >= 2) return callback({ error: true, message: "Room is full" });

      await socket.join(roomID);
      const newPlayer = { id: socket.id, username: socket.data.username, orientation: "black" };
      const updated = { ...roomObj, players: [...roomObj.players, newPlayer] };
      rooms.set(roomID, updated);

      callback({ players: updated.players, timeControl: updated.timeControl });
      io.in(roomID).emit("opponent joined", { players: updated.players, timeControl: updated.timeControl });
    });

    socket.on("move", (data) => io.in(data.room).emit("move", data));
    socket.on("resign", (roomID) => {
      const room = rooms.get(roomID);
      const winner = room.players.find(p => p.id !== socket.id);
      io.in(roomID).emit("resign", { winner: winner?.username || "Opponent" });
      rooms.delete(roomID);
    });
  });
};
