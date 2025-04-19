import React, { useContext, useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import ChessGame from "./chessGame";
import Game from "./game";
import socket from "../socket";
import "../styles/room.css";
import { AuthContext } from "../context/AuthContext";

const Room = () => {
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();
  const { id } = useParams();
  const [players, setPlayers] = useState([]);
  const [orientation, setOrientation] = useState("white");

  // Set players from navigation state (if present)
  useEffect(() => {
    if (location.state?.players) {
      setPlayers(location.state.players);
    }
  }, [location.state]);

  // Listen for opponent joined
  useEffect(() => {
    socket.on("opponent joined", (roomData) => {
      setPlayers(roomData.players);
    });
    return () => socket.off("opponent joined");
  }, []);

  // Set orientation based on current user
  useEffect(() => {
    if (players.length) {
      const userPlayer = players.find(p => p.username === currentUser.displayName);
      setOrientation(userPlayer?.orientation || "white");
    }
  }, [players, currentUser.displayName]);

  const cleanup = () => {
    setPlayers([]);
    setOrientation("white");
  };

  const CopyText = () => {
    setOrientation("white");
    // checkOrientation1();
    console.log(orientation);
    navigator.clipboard.writeText(id);
    // alert("copied the room id");
  };

  return (
    <div>
      {players.length === 2 ? (
        <ChessGame
          room={id}
          players={players}
          username={currentUser}
          orientation={orientation}
          cleanup={cleanup}
        />
      ) : (
        <div className="Invite">
          <h5>Invite others to join </h5>
          <div id="sample">{id}</div>
          <button className="copy" onClick={CopyText}>
            Copy
          </button>
        </div>
      )}
    </div>
  );
};

export default Room;