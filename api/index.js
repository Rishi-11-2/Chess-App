const express = require("express");
const { v4: uuid } = require("uuid");
const app = express();
const http = require("http");
const cors = require("cors");
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cors());
app.use(express.json());
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: "*", // Allow connections from client side
});

app.post("/data", (req, res) => {
  res.send("hi");
});
app.get("/", (req, res) => {
  res.render("home");
});

// In-memory rooms data
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  // Store the username of the connected player
  socket.on("username", (username) => {
    socket.data.username = username;
  });

  // Handle room creation
  socket.on("createRoom", async (callback) => {
    const roomID = uuid();  // Generate a unique room ID
    console.log("Room created:", roomID);
    
    // Add the creator to the room and set up the room in memory
    await socket.join(roomID);
    rooms.set(roomID, {
      roomID,
      players: [{ id: socket.id, username: socket.data?.username }],
    });
    
    callback(roomID); // Send the room ID back to the client
  });

  // Handle joining a room
  socket.on("joinRoom", async (args, callback) => {
    const room = rooms.get(args.roomID);  // Get the room from memory
    console.log("Joining room:", room);

    // Error checking for room availability
    let error, message;
    if (!room) {
      error = true;
      message = "No such room exists";
    } else if (room.players.length <= 0) {
      error = true;
      message = "Room is empty";
    } else if (room.players.length >= 2) {
      error = true;
      message = "Room is full. You cannot join.";
    }

    // If there's an error, send it to the client
    if (error) {
      if (callback) {
        callback({ error, message });
      }
      return;
    }

    // Join the player to the room
    await socket.join(args.roomID);

    // Update the room's player list
    const updatedRoom = {
      ...room,
      players: [
        ...room.players,
        { id: socket.id, username: socket.data?.username },
      ],
    };

    // Store the updated room data
    rooms.set(args.roomID, updatedRoom);

    // Notify the new player about the updated room state
    callback(updatedRoom);

    // Emit an event to the room that the opponent has joined
    io.in(args.roomID).emit("opponentJoined", updatedRoom);

    // If two players have joined, emit the startGame event
    if (updatedRoom.players.length === 2) {
      io.in(args.roomID).emit("startGame", updatedRoom);
    }
  });

  // Handle move synchronization between players
  socket.on("move", (data) => {
    console.log("Move received:", data);
    io.in(data.room).emit("move", data.move);  // Broadcast the move to everyone in the room
  });

  // Handle disconnects and room cleanup
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);

    // Check all rooms and remove the player if they are in any room
    for (let [roomID, room] of rooms) {
      const playerIndex = room.players.findIndex((p) => p.id === socket.id);

      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);  // Remove the player from the room

        if (room.players.length === 0) {
          rooms.delete(roomID);  // Delete the room if empty
        } else {
          rooms.set(roomID, room);  // Update the room if players remain
          io.in(roomID).emit("playerLeft", room);  // Notify the remaining player
        }
      }
    }
  });
});

server.listen(8000, () => {
  console.log("Server is listening on port 8000");
});
