import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import socket from "../socket";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ChessGame from "./chessGame";

const Game = () => {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const [err, setErr] = useState(false);
  const navigate = useNavigate();
  socket.emit("username", currentUser.displayName);

  const cleanup = () => {
    setErr(false);
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
        // Navigate with room data for initial render in Room
        navigate(`/rooms/${roomId}`, { state: { players: r.players } });
      }
    });
  };
  return (
    <div style={{
      backgroundColor: darkMode ? '#2c3e50' : '#fff',
      color: darkMode ? '#ecf0f1' : '#2c3e50',
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0, color: darkMode ? '#ecf0f1' : '#2c3e50' }}>
          Chess Room
        </h1>
        <h3 style={{ margin: '10px 0 20px', color: darkMode ? '#bdc3c7' : '#34495e' }}>
          Create a new room or join an existing one
        </h3>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button onClick={createARoom} style={{ padding: '12px 24px', fontSize: '16px', backgroundColor: '#31c09c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Create Room
          </button>
          <form onSubmit={joinRoom} style={{ display: 'flex', gap: '10px' }}>
            <input required placeholder="Room ID" style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }} />
            <button type="submit" style={{ padding: '12px 24px', fontSize: '16px', backgroundColor: '#d5df18', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Join Room
            </button>
          </form>
        </div>
      </div>
      {/* ChessGame is rendered on /rooms/:id route via Room component */}
    </div>
  );
};

export default Game;