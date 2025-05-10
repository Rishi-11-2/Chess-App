import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Game from "./components/game";
import Room from "./components/room";
import ChessGame from "./components/chessGame";
import History from "./components/History";
import MoveAnalysis from "./components/MoveAnalysis";
import { Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { ThemeContext } from "./context/ThemeContext.jsx";

function App() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode, toggleDarkMode, colors, styles } = useContext(ThemeContext);
  const location = useLocation();
  console.log(currentUser);

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/register" />;
    }
    return children;
  };

  return (
    <div className="app-container" style={{
      backgroundColor: colors.background,
      color: colors.textPrimary,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      width: '100%'
    }}>
      {location.pathname !== "/" && (
        <header style={{ 
          width: "100%", 
          display: "flex", 
          alignItems: "center", 
          padding: "1rem",
          backgroundColor: colors.surfacePrimary,
          boxShadow: styles.boxShadowLight,
          borderBottom: `1px solid ${colors.border}`
        }}>
          <Link 
            to="/history" 
            style={{ 
              marginRight: "auto", 
              fontSize: "16px", 
              color: colors.primary, 
              textDecoration: "none",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.primary,
              color: "#fff",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              fontSize: "14px"
            }}>H</span>
            History
          </Link>
          <button 
            onClick={toggleDarkMode} 
            style={{
              backgroundColor: darkMode ? colors.primary : colors.secondary,
              color: "#fff",
              padding: "8px 16px",
              borderRadius: styles.buttonRadius,
              fontWeight: 500,
              boxShadow: styles.boxShadowLight,
              transition: styles.transition,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </header>
      )}
      <main style={{ 
        width: "100%", 
        flex: 1, 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        padding: "1rem"
      }}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
          <Route path="/rooms/:id" element={<ProtectedRoute><Room /></ProtectedRoute>} />
          <Route path="/chessGame" element={<ProtectedRoute><ChessGame /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/analysis/:gameId" element={<ProtectedRoute><MoveAnalysis /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
