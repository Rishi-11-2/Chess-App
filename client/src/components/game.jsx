import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import socket from "../services/socket";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ChessGame from "./chessGame";

const Game = () => {
  const { currentUser } = useContext(AuthContext);
  const { darkMode, colors, styles } = useContext(ThemeContext);
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
        // Navigate with server's timeControl and initial players for rendering
        navigate(`/rooms/${roomId}`, { state: { timeControl: r.timeControl, players: r.players } });
      }
    });
  };

  const cardStyle = {
    backgroundColor: colors.surfacePrimary,
    borderRadius: styles.cardRadius,
    padding: '2rem',
    boxShadow: styles.boxShadowMedium,
    maxWidth: '900px',
    width: '100%',
    margin: '0 auto'
  };

  const sectionStyle = {
    backgroundColor: colors.surfaceSecondary,
    padding: '1.5rem',
    borderRadius: styles.cardRadius,
    boxShadow: styles.boxShadowLight,
    transition: styles.transition,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  };

  const buttonStyle = (type) => ({
    backgroundColor: type === 'create' ? colors.success : colors.info,
    color: '#fff',
    padding: '12px 24px',
    fontSize: '16px',
    border: 'none',
    borderRadius: styles.buttonRadius,
    cursor: 'pointer',
    fontWeight: '500',
    boxShadow: styles.boxShadowLight,
    transition: styles.transition,
    width: '100%'
  });

  const inputStyle = {
    padding: '12px',
    fontSize: '16px',
    borderRadius: styles.buttonRadius,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.background,
    color: colors.textPrimary,
    width: '100%'
  };

  return (
    <div style={{
      backgroundColor: colors.background,
      color: colors.textPrimary,
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px'
    }}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            margin: 0, 
            color: colors.primary,
            marginBottom: '0.5rem'
          }}>
            Chess Room
          </h1>
          <h3 style={{ 
            margin: '10px 0 20px', 
            color: colors.textSecondary,
            fontWeight: '400'
          }}>
            Create a new room or join an existing one
          </h3>
          
          {err && (
            <div style={{
              backgroundColor: colors.error,
              color: '#fff',
              padding: '0.75rem',
              borderRadius: styles.buttonRadius,
              marginBottom: '1rem'
            }}>
              Room not found or already full. Please try a different room ID.
            </div>
          )}
          
          <div style={{ 
            display: 'flex', 
            gap: '2rem', 
            justifyContent: 'center', 
            marginTop: '20px',
            flexWrap: 'wrap'
          }}>
            {/* New Game section with timer */}
            <div style={sectionStyle}>
              <h4 style={{ 
                marginBottom: '0.5rem', 
                color: colors.textPrimary,
                alignSelf: 'flex-start'
              }}>
                New Game
              </h4>
              <div style={{ margin: '10px 0', width: '100%' }}>
                <label style={{ 
                  marginRight: '10px', 
                  fontSize: '16px', 
                  color: colors.textPrimary,
                  display: 'block',
                  marginBottom: '0.5rem'
                }}>
                  Time Control:
                </label>
                <select 
                  value={timeControl} 
                  onChange={e => setTimeControl(Number(e.target.value))} 
                  style={{
                    padding: '10px',
                    fontSize: '16px',
                    borderRadius: styles.buttonRadius,
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                    width: '100%'
                  }}
                >
                  <option value={1}>1 minute</option>
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                </select>
              </div>
              <button 
                onClick={createARoom} 
                style={buttonStyle('create')}
              >
                Create Room
              </button>
            </div>
            
            {/* Join Game section without timer */}
            <div style={sectionStyle}>
              <h4 style={{ 
                marginBottom: '0.5rem', 
                color: colors.textPrimary,
                alignSelf: 'flex-start'
              }}>
                Join Game
              </h4>
              <form onSubmit={joinRoom} style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '1rem', 
                width: '100%'
              }}>
                <input 
                  required 
                  placeholder="Room ID" 
                  style={inputStyle}
                />
                <button 
                  type="submit" 
                  style={buttonStyle('join')}
                >
                  Join Room
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;