 import React, { useContext, useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import ChessGame from "./chessGame";
import socket from "../socket";
import "../styles/room.css";
import { AuthContext } from "../context/AuthContext";

const Room = () => {
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();
  const { id } = useParams();
  const [players, setPlayers] = useState(location.state?.players || []);
  const [orientation, setOrientation] = useState("white");
  // Time control in minutes (default 5)
  const [timeControl, setTimeControl] = useState(location.state?.timeControl || 5);

  // Players updated via socket events
  // on create/join the server emits opponent joined, populating players

  // Listen for opponent joined
  useEffect(() => {
    socket.on("opponent joined", (roomData) => {
      setPlayers(roomData.players);
    });
    return () => socket.off("opponent joined");
  }, []);

  // Update timeControl if passed via navigation
  useEffect(() => {
    if (location.state?.timeControl) setTimeControl(location.state.timeControl);
  }, [location.state?.timeControl]);

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
          cleanup={cleanup}
          timeControl={timeControl}
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