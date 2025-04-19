import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

import { useCallback, useEffect, useState, useContext } from "react";
import socket from "../socket";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

const ChessGame = ({ players, room, orientation, cleanup }) => {
  // console.log(players);
  const [chess, setChess] = useState();
  const { currentUser } = useContext(AuthContext);
  console.log(currentUser);
  const [position, setPosition] = useState("start");
  useEffect(() => {
    setChess(new Chess());
  }, []);
  // because of useMemo hook chess instance is memoized such that between every re-renders
  // a new chess instance is not created
  const [over, setOver] = useState("");
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const MakeAMove = useCallback(
    (move) => {
      try {
        console.log("making a move", move);
        const result = chess.move(move);
        setPosition(chess.fen());
        if (chess.isGameOver) {
          if (chess.isCheckmate()) {
            setOver(
              `Checkmate !!! ${chess.turn() === "w" ? "black" : "white"} wins`
            );
          } else if (chess.isDraw()) {
            setOver("Draw");
          } else if (chess.isInsufficientMaterial()) {
            setOver("Insufficient Material");
          } else if (chess.isStalemate()) {
            setOver("Stalemate");
          } else setOver("Game Over");
        }
        return result;
      } catch (e) {
        console.log("hi", e);
        return null;
      }
    },
    [chess]
  );
  const onDrop = (sourceSquare, targetSquare) => {
    if (chess.turn() !== orientation[0]) return false; // <- 1 prohibit player from moving piece of other player
    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      color: chess.turn(),
    };
    // console.log(moveData);
    const move = MakeAMove(moveData);
    if (move == null) return false;
    socket.emit("move", {
      move,
      room,
    });
    return true;
  };
  useEffect(() => {
    socket.on("move", (move) => {
      MakeAMove(move);
    });
  }, [MakeAMove]);
  useEffect(() => {
    socket.on('resign', ({ winner }) => {
      setOver(winner === currentUser.displayName ? 'You win' : 'You lose');
    });
    return () => socket.off('resign');
  }, [currentUser.displayName]);
  useEffect(() => {
    if (over) {
      setTimeout(() => {
        cleanup();
        navigate('/');
      }, 3000);
    }
  }, [over, cleanup, navigate]);
  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: darkMode ? '#2c3e50' : '#fff', transition: 'background-color 0.3s' }}>
      {/* Resign button top-left */}
      <button onClick={() => socket.emit('resign', room)}
        style={{
          position: 'absolute', top: '20px', left: '20px',
          padding: '16px 32px', fontSize: '18px', fontWeight: 600,
          backgroundColor: '#e74c3c', color: '#fff', border: 'none',
          borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        Resign
      </button>
      <div
        style={{
          paddingLeft: 350,
        }}
      >
        {players
          .filter((player) => {
            return player.username !== currentUser.displayName;
          })
          .map((player) => (
            <div key={player.id}>
              <h3 style={{ color: darkMode ? '#ecf0f1' : '#2c3e50', fontSize: '18px' }}>
                {player.username}
              </h3>
            </div>
          ))}
      </div>
      <div
        className="chessboard"
        style={{
          width: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: 350,
        }}
      >
        {over && (
          <div style={{
            textAlign: 'center', marginBottom: '24px', fontSize: '24px',
            color: darkMode ? '#2c3e50' : '#ecf0f1', backgroundColor: darkMode ? '#ecf0f1' : '#2c3e50',
            padding: '12px 20px', borderRadius: '12px'
          }}>
            {over}
          </div>
        )}
        <Chessboard
          position={position}
          onPieceDrop={onDrop}
          boardOrientation={orientation}
          boardWidth={700}
          boardStyle={{ borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.4)' }}
          lightSquareStyle={{ backgroundColor: '#eeeed2' }}
          darkSquareStyle={{ backgroundColor: '#769656' }}
        />
      </div>
    </div>
  );
};

export default ChessGame;
