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
  cors: "*", // dont forget it otherwise it will not allow connection from client side
});

app.post("/data", (req, res) => {
  // console.log(req.body.user);
  res.send("hi");
});
app.get("/", (req, res) => {
  res.render("home");
});
const rooms = new Map();
io.on("connection", (socket) => {
  console.log("socket connected", socket.id);
  socket.on("username", (username) => {
    // console.log(username);
    socket.data.username = username;
  });
  socket.on("createRoom", async (callback) => {
    const roomID = uuid();
    console.log("room creation", roomID);
    await socket.join(roomID);
    rooms.set(roomID, {
      roomID,
      players: [{ id: socket.id, username: socket.data?.username }],
    });
    callback(roomID);
  });

  socket.on("joinRoom", async (args, callback) => {
    const room = rooms.get(args.roomID);
    console.log(room);
    let error, message;
    if (!room) {
      error = true;
      message = "No such room exist";
    } else if (room.length < 0) {
      error = true;
      message = "Room is empty";
    } else if (room.length > 2) {
      error = true;
      message = "Room is full.  You cannot join";
    }

    if (error) {
      if (callback) {
        callback({
          error,
          message,
        });
      }
      return;
    }

    await socket.join(args.roomID);

    const roomUpdate = {
      ...room,
      players: [
        ...room.players,
        {
          id: socket.id,
          username: socket.data?.username,
        },
      ],
    };
    callback(roomUpdate);
    rooms.set(args.roomID, roomUpdate);
    io.in(args.roomID).emit("opponent joined", roomUpdate);
  });

  socket.on("move", (data) => {
    io.in(data.room).emit("move", data.move);
  });
});

server.listen(8000, () => {
  console.log("listening on port 8000");
});
