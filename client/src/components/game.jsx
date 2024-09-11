import React, { useContext, useState, useEffect } from "react";
import socket from "../socket";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ChessGame from "./chessGame";
import "../styles/game.css";

const Game = () => {
  const { currentUser } = useContext(AuthContext);
  const [err, setErr] = useState(false);
  const navigate = useNavigate();
  const [players, setPlayers] = useState({});
  const [play, setPlay] = useState(false);
  const [id, setId] = useState(0);
  const [orientation, setOrientation] = useState(false);
  const [showSharingBox, setShowSharingBox] = useState(false);

  useEffect(() => {
    // Listen for 'startGame' event from the server
    socket.on("startGame", (gameData) => {
      console.log("Game started", gameData);
      setPlayers(gameData.players);
      setPlay(true);
    });

    return () => {
      socket.off("startGame");
    };
  }, []);

  socket.emit("username", currentUser.displayName);

  const cleanup = () => {
    setPlayers("");
    setOrientation(false);
    setPlay(false);
    setShowSharingBox(false);
  };

  const createARoom = () => {
    socket.emit("createRoom", (r) => {
      console.log("Room created:", r);
      setId(r);
      setShowSharingBox(true);
    });
  };

  const joinRoom = (e) => {
    e.preventDefault();
    const roomId = e.target[0].value;
    console.log("Attempting to join room:", roomId);

    socket.emit("joinRoom", { roomID: roomId }, (response) => {
      if (response.error) {
        setErr(true);
        console.log("Error joining room:", response.error);
      } else {
        console.log("Successfully joined room:", roomId);
        setId(roomId);
        setOrientation("white");
        
        // Emit 'playerJoined' to notify the server
        socket.emit("playerJoined", { roomID: roomId, player: currentUser.displayName });

        navigate(`/rooms/${roomId}`);
      }
    });
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(id);
    alert("Room ID copied to clipboard!");
  };

  return (
    <div className="game-container">
      {!play && !showSharingBox && (
        <div>
          <h1 className="heading">Chess Room</h1>
          <h3>
            Create a new room or join an existing room by entering the link
          </h3>
          <div className="container">
            <button className="button-36" onClick={createARoom}>
              Create a new room
            </button>
            <form onSubmit={joinRoom}>
              <input
                required
                placeholder="Enter the ID of room you wish to join"
              />
              <button className="button-36" type="submit">
                Click to join the room
              </button>
            </form>
            {err && (
              <div className="error-message">
                Error joining room. Please try again.
              </div>
            )}
          </div>
        </div>
      )}

      {showSharingBox && (
        <div className="sharing-box">
          <h2>Share this room ID with your opponent</h2>
          <div className="room-id">{id}</div>
          <button className="button-36 copy-button" onClick={copyRoomId}>
            Copy Room ID
          </button>
          <button
            className="button-36"
            onClick={() => navigate(`/rooms/${id}`)}
          >
            Enter Room
          </button>
        </div>
      )}

      {play && (
        <ChessGame
          room={id}
          players={players}
          username={currentUser.displayName}
          orientation={orientation}
          cleanup={cleanup}
        />
      )}
    </div>
  );
};

export default Game;
