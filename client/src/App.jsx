import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Game from "./components/game";
import Room from "./components/room";
import ChessGame from "./components/chessGame";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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
        <header style={{ width: "100%", display: "flex", justifyContent: "flex-end", padding: "1rem" }}>
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
        </Routes>
      </main>
    </div>
  );
}

export default App;
