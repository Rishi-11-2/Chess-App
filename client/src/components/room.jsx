 import React, { useContext, useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import ChessGame from "./chessGame";
import socket from "../services/socket";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

const Room = () => {
  const { currentUser } = useContext(AuthContext);
  const { colors, styles } = useContext(ThemeContext);
  const location = useLocation();
  const { id } = useParams();
  const [players, setPlayers] = useState(location.state?.players || []);
  const [orientation, setOrientation] = useState("white");
  const [copySuccess, setCopySuccess] = useState(false);
  // Time control in minutes (default 5)
  const [timeControl, setTimeContent] = useState(location.state?.timeControl || 5);

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
    if (location.state?.timeControl) setTimeContent(location.state.timeControl);
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

  const copyRoomId = () => {
    setOrientation("white");
    // checkOrientation1();
    console.log(orientation);
    navigator.clipboard.writeText(id);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Container styles
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    minHeight: '70vh',
    backgroundColor: colors.background
  };

  // Card styles
  const cardStyle = {
    backgroundColor: colors.surfacePrimary,
    padding: '2rem',
    borderRadius: styles.cardRadius,
    boxShadow: styles.boxShadowMedium,
    width: '100%',
    maxWidth: '500px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  };

  // Room ID display styles
  const roomIdStyle = {
    padding: '1rem 1.5rem',
    backgroundColor: colors.surfaceSecondary,
    color: colors.textPrimary,
    borderRadius: styles.buttonRadius,
    fontFamily: 'monospace',
    fontSize: '1.2rem',
    marginBottom: '1.5rem',
    width: '80%',
    textAlign: 'center',
    border: `1px dashed ${colors.border}`,
    position: 'relative'
  };

  // Button styles
  const buttonStyle = {
    backgroundColor: copySuccess ? colors.success : colors.primary,
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: styles.buttonRadius,
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: styles.transition
  };

  // Title styles
  const titleStyle = {
    color: colors.primary,
    fontSize: '1.75rem',
    marginBottom: '1.5rem'
  };

  // Waiting message styles
  const waitingMessageStyle = {
    color: colors.textSecondary,
    marginBottom: '1rem',
    fontSize: '1rem'
  };

  // Player info styles
  const playerInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: styles.buttonRadius
  };

  // Avatar styles
  const avatarStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: colors.primary,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  };

  return (
    <div style={containerStyle}>
      {players.length === 2 ? (
        <ChessGame
          room={id}
          players={players}
          cleanup={cleanup}
          timeControl={timeControl}
        />
      ) : (
        <div style={cardStyle}>
          <h2 style={titleStyle}>Waiting for Opponent</h2>
          
          <div style={playerInfoStyle}>
            <div style={avatarStyle}>
              {currentUser.displayName?.charAt(0).toUpperCase() || 'P'}
            </div>
            <span style={{ color: colors.textPrimary }}>
              {currentUser.displayName} (You)
            </span>
          </div>
          
          <p style={waitingMessageStyle}>
            Share this room ID with a friend to start the game
          </p>
          
          <div style={roomIdStyle}>
            {id}
          </div>
          
          <button 
            style={buttonStyle} 
            onClick={copyRoomId}
          >
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ opacity: 0.9 }}
            >
              <path 
                d="M8 4V16C8 16.5304 8.21071 17.0391 8.58579 17.4142C8.96086 17.7893 9.46957 18 10 18H18C18.5304 18 19.0391 17.7893 19.4142 17.4142C19.7893 17.0391 20 16.5304 20 16V7.242C20 6.97556 19.9467 6.71181 19.8433 6.46624C19.7399 6.22068 19.5885 5.99824 19.398 5.812L16.188 2.602C16.0017 2.41148 15.7793 2.26012 15.5338 2.15672C15.2882 2.05333 15.0244 2 14.758 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M16 18V20C16 20.5304 15.7893 21.0391 15.4142 21.4142C15.0391 21.7893 14.5304 22 14 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V8C4 7.46957 4.21071 6.96086 4.58579 6.58579C4.96086 6.21071 5.46957 6 6 6H8" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            {copySuccess ? 'Copied!' : 'Copy Room ID'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Room;