import React, { useContext, useEffect, useState, useNavigate } from "react";
import { useParams } from "react-router-dom";
import ChessGame from "./chessGame";
import Game from "./game";
import socket from "../socket";
import "../styles/room.css";
import { AuthContext } from "../context/AuthContext";
const Room = ({ check }) => {
  const currentUser = useContext(AuthContext);
  const { id } = useParams();
  const [players, setPlayers] = useState({});
  const [play, setPlay] = useState(false);
  const [orientation, setOrientation] = useState(false);
  if (check === true) {
    setPlay(check);
  }
  const cleanup = () => {
    setPlayers("");
    setOrientation(false);
    setPlay(false);
  };
  useEffect(() => {
    socket.on("opponent joined", (roomData) => {
      console.log("opponent joined", roomData, currentUser);
      setPlayers(roomData.players);
      setPlay(true);
      setOrientation("black");
      console.log(players);
    });
    return () => {
      socket.off("opponent joined");
    };
  }, []);
  const CopyText = () => {
    setOrientation("white");
    // checkOrientation1();
    console.log(orientation);
    navigator.clipboard.writeText(id);
    // alert("copied the room id");
  };
  return (
    <div>
      {play && (
        <ChessGame
          room={id}
          players={players}
          username={currentUser}
          orientation={orientation}
          cleanup={cleanup}
        />
      )}
      {!play && (
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
