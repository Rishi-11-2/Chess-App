import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

import { useCallback, useEffect, useState, useContext } from "react";
import socket from "../socket";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const ChessGame = ({ players, room, cleanup, timeControl }) => {
  // console.log(players);
  const [chess, setChess] = useState();
  const { currentUser } = useContext(AuthContext);
  // Determine this player's orientation (match by socket ID first, fallback to username)
  let userPlayer = players.find(p => p.id === socket.id);
  if (!userPlayer) {
    userPlayer = players.find(p => p.username === currentUser.displayName);
  }
  const orientation = userPlayer?.orientation || 'white';
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
        if (chess.isGameOver()) {
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
    if (chess.turn() !== orientation[0]) return false; // only allow own color
    const moveData = { from: sourceSquare, to: targetSquare };
    const move = MakeAMove(moveData);
    if (move == null) return false;
    // Broadcast move and timers for synchronization
    socket.emit("move", { move, room, whiteTime, blackTime });
    return true;
  };
  useEffect(() => {
    // Receive move and sync clocks
    socket.on("move", ({ move, whiteTime: wTime, blackTime: bTime }) => {
      MakeAMove(move);
      setWhiteTime(wTime);
      setBlackTime(bTime);
    });
    return () => socket.off("move");
  }, [MakeAMove]);
  useEffect(() => {
    socket.on('resign', ({ winner }) => {
      setOver(winner === currentUser.displayName ? 'You win' : 'You lose');
    });
    return () => socket.off('resign');
  }, [currentUser.displayName]);
  useEffect(() => {
    if (over) {
      // Save history entry for current user
      (async () => {
        const opponentPlayer = players.find(p => p.username !== currentUser.displayName);
        const opponent = opponentPlayer?.username || 'Unknown';
        let result;
        if (
          over === 'Draw' ||
          over.includes('Draw') ||
          over.includes('Stalemate') ||
          over.includes('Insufficient Material')
        ) {
          result = 'Draw';
        } else if (over === 'You win' || over.includes(`${orientation} wins`)) {
          result = 'Win';
        } else {
          result = 'Loss';
        }
        console.debug('Saving match history:', {
          player: currentUser.displayName,
          opponent,
          result,
          timeControl
        });
        try {
          const entry = {
            date: serverTimestamp(),
            player: currentUser.displayName,
            playerId: currentUser.uid,
            opponent,
            result,
            timeControl
          };
          const docRef = await addDoc(collection(db, 'matchHistory'), entry);
          console.debug('Match history saved, doc ID:', docRef.id);
        } catch (e) {
          console.error('Error saving history', e);
        }
      })();
      setTimeout(() => {
        cleanup();
        navigate('/');
      }, 3000);
    }
  }, [over, cleanup, navigate, players, currentUser.displayName, orientation, timeControl]);
  // Initialize timers (seconds)
  const [whiteTime, setWhiteTime] = useState(timeControl * 60);
  const [blackTime, setBlackTime] = useState(timeControl * 60);
  // Format mm:ss
  const formatTime = secs => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };
  // Handle timeout: emit resign
  const handleTimeout = () => {
    socket.emit('resign', room);
  };
  // Countdown timer
  useEffect(() => {
    if (!chess) return;
    const timerId = setInterval(() => {
      if (over) return;
      const turnColor = chess.turn() === 'w' ? 'white' : 'black';
      if (turnColor === 'white') {
        setWhiteTime(prev => {
          if (prev <= 1) { handleTimeout(); return 0; }
          return prev - 1;
        });
      } else {
        setBlackTime(prev => {
          if (prev <= 1) { handleTimeout(); return 0; }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(timerId);
  }, [chess, over]);

  // Highlight possible moves and checkmated king square
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [checkmatedKingSquare, setCheckmatedKingSquare] = useState(null);

  // Determine and mark checkmated king square
  useEffect(() => {
    if (over.includes('Checkmate') && chess) {
      const losingColor = over.includes('white wins') ? 'b' : 'w';
      const boardArr = chess.board();
      for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
          const piece = boardArr[r][f];
          if (piece?.type === 'k' && piece.color === losingColor) {
            setCheckmatedKingSquare('abcdefgh'[f] + (8 - r));
            return;
          }
        }
      }
    }
  }, [over, chess]);

  // Handle square click for legal-move highlighting
  const handleSquareClick = useCallback((square) => {
    if (!chess) return;
    const moves = chess.moves({ square, verbose: true });
    if (moves.length) {
      setSelectedSquare(square);
      setPossibleMoves(moves.map(m => m.to));
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  }, [chess]);

  // Build custom square styles
  const squareStyles = {};
  if (selectedSquare) squareStyles[selectedSquare] = { backgroundColor: 'rgba(246,246,105,0.6)' };
  possibleMoves.forEach(sq => { squareStyles[sq] = { backgroundColor: 'rgba(246,246,105,0.6)' }; });
  if (checkmatedKingSquare) squareStyles[checkmatedKingSquare] = { boxShadow: 'inset 0 0 0 4px red' };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: darkMode ? '#2c3e50' : '#fff', transition: 'background-color 0.3s', padding: '20px' }}>
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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: "700px",
          margin: "0 auto",
          gap: "16px",
        }}
      >
        {/* Result message */}
        {over && (
          <div style={{
            textAlign: 'center', marginBottom: '24px', fontSize: '24px',
            color: darkMode ? '#2c3e50' : '#ecf0f1', backgroundColor: darkMode ? '#ecf0f1' : '#2c3e50',
            padding: '12px 20px', borderRadius: '12px'
          }}>
            {over}
          </div>
        )}
        {/* Timers */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          fontSize: "18px",
          color: darkMode ? "#ecf0f1" : "#2c3e50"
        }}>
          <span>White: {formatTime(whiteTime)}</span>
          <span>Black: {formatTime(blackTime)}</span>
        </div>
        {/* Chessboard */}
        <Chessboard
          position={position}
          onPieceDrop={onDrop}
          onSquareClick={handleSquareClick}
          customSquareStyles={squareStyles}
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
