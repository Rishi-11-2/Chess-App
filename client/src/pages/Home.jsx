import React, { useContext } from "react";
import "../styles/home.css";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import socket from "../socket";
import { useNavigate } from "react-router-dom";
const Home = () => {
  const { currentUser } = useContext(AuthContext);
  const Navigate = useNavigate();
  const handleClick = async (e) => {
    try {
      console.log(socket.id);
      socket.emit("username", currentUser.displayName);
      await axios.post("http://localhost:8000/data", {
        user: currentUser,
      });
      Navigate("/game");
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="Home">
      <div className="Container">
        <h1 className="Header">Welcome to Chess</h1>
        <p>Ready to challenge your mind?</p>
        <div className="buttons">
          <button onClick={handleClick} className="chess-button">
            Start Playing Chess
          </button>
        </div>
      </div>
    </div>
  );
};
export default Home;
