import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Game from "./components/game";
import Room from "./components/room";
import ChessGame from "./components/chessGame";
import History from "./components/History";
import { Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { ThemeContext } from "./context/ThemeContext.jsx";

function App() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const location = useLocation();
  console.log(currentUser);

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/register" />;
    }
    return children;
  };

  return (
    <div className="app-container">
      {location.pathname !== "/" && (
        <header style={{ width: "100%", display: "flex", alignItems: "center", padding: "1rem" }}>
          <Link to="/history" style={{ marginRight: "auto", fontSize: "16px", color: darkMode ? "#ecf0f1" : "#2c3e50", textDecoration: "none" }}>
            History
          </Link>
          <button onClick={toggleDarkMode} className="theme-toggle-btn">
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </header>
      )}
      <main style={{ width: "100%", flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
          <Route path="/rooms/:id" element={<ProtectedRoute><Room /></ProtectedRoute>} />
          <Route path="/chessGame" element={<ProtectedRoute><ChessGame /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
