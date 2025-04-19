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
  const [timeControl, setTimeControl] = useState(5);
  const navigate = useNavigate();
  socket.emit("username", currentUser.displayName);

  const cleanup = () => {
    setErr(false);
  };

  // creating a room with selected timeControl
  const createARoom = () => {
    socket.emit("createRoom", timeControl, (roomID) => {
      console.log(roomID);
      navigate(`/rooms/${roomID}`, { state: { timeControl } });
    });
  };

  // allowing users to join a room by entering their ID
  const joinRoom = (e) => {
    e.preventDefault();
    const roomId = e.target[0].value;
    socket.emit("joinRoom", { roomID: roomId }, (r) => {
      if (r.error) {
        setErr(true);
      } else {
        // Navigate with server’s timeControl and initial players for rendering
        navigate(`/rooms/${roomId}`, { state: { timeControl: r.timeControl, players: r.players } });
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
        <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', marginTop: '20px' }}>
          {/* New Game section with timer */}
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ marginBottom: '10px', color: darkMode ? '#ecf0f1' : '#2c3e50' }}>New Game</h4>
            <div style={{ margin: '10px 0' }}>
              <label style={{ marginRight: '10px', fontSize: '16px', color: darkMode ? '#ecf0f1' : '#2c3e50' }}>Time Control:</label>
              <select value={timeControl} onChange={e => setTimeControl(Number(e.target.value))} style={{ padding: '6px', fontSize: '16px' }}>
                <option value={1}>1 min</option>
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
              </select>
            </div>
            <button onClick={createARoom} style={{ padding: '12px 24px', fontSize: '16px', backgroundColor: '#31c09c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Create Room
            </button>
          </div>
          {/* Join Game section without timer */}
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ marginBottom: '10px', color: darkMode ? '#ecf0f1' : '#2c3e50' }}>Join Game</h4>
            <form onSubmit={joinRoom} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <input required placeholder="Room ID" style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }} />
              <button type="submit" style={{ padding: '12px 24px', fontSize: '16px', backgroundColor: '#d5df18', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Join Room
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* ChessGame is rendered on /rooms/:id route via Room component */}
    </div>
  );
};

export default Game;