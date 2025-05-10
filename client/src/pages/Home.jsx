import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import axios from "axios";
import socket from "../services/socket";
import { useNavigate } from "react-router-dom";
import chessLogo from "../img/chess-logo.png"; 

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  const { colors, styles } = useContext(ThemeContext);
  const navigate = useNavigate();
  
  const handleClick = async (e) => {
    try {
      console.log(socket.id);
      socket.emit("username", currentUser.displayName);
      await axios.post("http://localhost:8000/data", {
        user: currentUser,
      });
      navigate("/game");
    } catch (err) {
      console.log(err);
    }
  };
  
  // Styles
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '2rem',
    backgroundColor: colors.background,
    textAlign: 'center'
  };
  
  const cardStyle = {
    backgroundColor: colors.surfacePrimary,
    borderRadius: styles.cardRadius,
    boxShadow: styles.boxShadowMedium,
    padding: '3rem',
    maxWidth: '600px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  };
  
  const headerStyle = {
    color: colors.primary,
    fontSize: '2.5rem',
    marginBottom: '1rem',
    fontWeight: '700'
  };
  
  const subtitleStyle = {
    color: colors.textSecondary,
    fontSize: '1.25rem',
    marginBottom: '2rem',
    fontWeight: '400'
  };
  
  const buttonStyle = {
    backgroundColor: colors.primary,
    color: '#fff',
    padding: '1rem 2rem',
    borderRadius: styles.buttonRadius,
    border: 'none',
    fontSize: '1.1rem',
    fontWeight: '500',
    cursor: 'pointer',
    boxShadow: styles.boxShadowLight,
    transition: styles.transition,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  };
  
  const logoStyle = {
    maxWidth: '80px',
    marginBottom: '1.5rem'
  };
  
  const userInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1.5rem',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: styles.buttonRadius,
    marginBottom: '2rem'
  };
  
  const avatarStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    marginRight: '1rem',
    objectFit: 'cover',
    border: `2px solid ${colors.primary}`
  };
  
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* If there's a chess logo image, use it */}
        {chessLogo && (
          <img 
            src={chessLogo} 
            alt="Chess Logo" 
            style={logoStyle}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        
        <h1 style={headerStyle}>Welcome to Chess App</h1>
        <p style={subtitleStyle}>Ready to challenge your mind with the ultimate strategy game?</p>
        
        {currentUser && (
          <div style={userInfoStyle}>
            {currentUser.photoURL ? (
              <img 
                src={currentUser.photoURL} 
                alt={currentUser.displayName} 
                style={avatarStyle}
              />
            ) : (
              <div style={{
                ...avatarStyle,
                backgroundColor: colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '1.25rem'
              }}>
                {currentUser.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <span style={{ color: colors.textPrimary }}>
              Logged in as <strong>{currentUser.displayName || currentUser.email}</strong>
            </span>
          </div>
        )}
        
        <button 
          onClick={handleClick} 
          style={buttonStyle}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M10 4L18 12L10 20" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          Start Playing Chess
        </button>
      </div>
    </div>
  );
};

export default Home;
