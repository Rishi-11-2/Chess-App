import React, { useContext, useState } from "react";
import socket from "../socket";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ChessGame from "./chessGame";

const Game = () => {
  const { currentUser } = useContext(AuthContext);
  const [err, setErr] = useState(false);
  const navigate = useNavigate();
  const [players, setPlayers] = useState({});
  const [play, setPlay] = useState(false);
  const [id, setId] = useState(0);
  const [orientation, setOrientation] = useState(false);
  socket.emit("username", currentUser.displayName);

  const cleanup = () => {
    setPlayers("");
    setOrientation(false);
    setPlay(false);
  };
  // creating a room
  const createARoom = () => {
    socket.emit("createRoom", (r) => {
      console.log(r);
      navigate(`/rooms/${r}`);
    });
  };

  // allowing users to join a room by entering their ID
  const joinRoom = (e) => {
    e.preventDefault();
    const roomId = e.target[0].value;
    console.log("hi", roomId);
    socket.emit("joinRoom", { roomID: roomId }, (r) => {
      if (r.error) {
        setErr(true);
        console.log("error");
      } else {
        setPlay(true);
        setId(roomId);
        setOrientation("white");
        setPlayers(r.players);
      }
    });
  };
  return (
    <div>
      {!play && (
        <div>
          <h1 className="heading">Chess Room</h1>
          <h3>
            Create a new room or join an existing room by entering the link
          </h3>
          <div className="container">
            <button onClick={createARoom}>Create a new room</button>

            <form onSubmit={joinRoom}>
              <input
                required
                placeholder="enter the ID of room you wish to join"
              />
              <button type="submit">Click to join the room</button>
            </form>
          </div>
        </div>
      )}
      {play && (
        <ChessGame
          room={id}
          players={players}
          username={currentUser}
          orientation={orientation}
          cleanup={cleanup}
        />
      )}
    </div>
  );
};

export default Game;
