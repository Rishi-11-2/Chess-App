import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

import { useCallback, useEffect, useState, useContext } from "react";
import socket from "../services/socket";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import moveHistoryService from "../services/moveHistoryService";

const ChessGame = ({ players, room, cleanup, timeControl }) => {
  // console.log(players);
  const [chess, setChess] = useState();
  const { currentUser } = useContext(AuthContext);
  const { colors, styles } = useContext(ThemeContext);
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
  const navigate = useNavigate();
  // Track move history for user, highlight possible moves, and checkmated king square
  const [moveHistory, setMoveHistory] = useState([]);
  // Track complete move history with full move objects for AI analysis
  const [completeMoveHistory, setCompleteMoveHistory] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [checkmatedKingSquare, setCheckmatedKingSquare] = useState(null);
  
  const MakeAMove = useCallback(
    (move) => {
      try {
        console.log("making a move", move);
        const result = chess.move(move);
        setPosition(chess.fen());
        
        // Record move with complete data for analysis
        if (result) {
          // Add full move data to complete history
          setCompleteMoveHistory(prev => [...prev, {
            ...result,
            fen: chess.fen(),
            timestamp: new Date().toISOString()
          }]);
          
          // Record SAN of user moves (for display purposes)
          if (result.color === orientation[0]) {
            setMoveHistory(prev => [...prev, result.san]);
          }
        }
        
        if (chess.isGameOver()) {
          if (chess.isCheckmate()) {
            setOver(`Checkmate !!! ${chess.turn() === "w" ? "black" : "white"} wins`);
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
    [chess, orientation]
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
      // Save detailed move history to JSON file
      const saveDetailedHistory = async () => {
        try {
          // Find opponent info
          const opponentPlayer = players.find(p => p.username !== currentUser.displayName);
          const opponent = opponentPlayer?.username || 'Unknown';
          
          // Determine game result
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
          
          // Determine players based on orientation
          const playerWhite = orientation === 'white' ? currentUser.displayName : opponent;
          const playerBlack = orientation === 'black' ? currentUser.displayName : opponent;
          
          // Prepare game data
          const gameData = {
            gameId: room,
            playerWhite,
            playerBlack,
            timeControl,
            result,
            date: new Date().toISOString(),
            moveHistory: completeMoveHistory
          };
          
          // Save move history to server
          await moveHistoryService.saveGameMoves(gameData);
          console.debug('Detailed move history saved successfully');
        } catch (error) {
          console.error('Error saving detailed move history:', error);
        }
      };
      
      // Execute both save operations
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
          // Save to Firestore (existing functionality)
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
          
          // Save detailed move history
          await saveDetailedHistory();
        } catch (e) {
          console.error('Error saving history', e);
        }
      })();
      setTimeout(() => {
        cleanup();
        navigate('/');
      }, 3000);
    }
  }, [over, cleanup, navigate, players, currentUser.displayName, orientation, timeControl, room, completeMoveHistory]);

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
  if (selectedSquare) squareStyles[selectedSquare] = { 
    backgroundColor: `${colors.primary}80` // Using primary color with 50% transparency
  };
  
  possibleMoves.forEach(sq => { 
    squareStyles[sq] = { 
      backgroundColor: `${colors.primary}80` // Using primary color with 50% transparency 
    }; 
  });
  
  if (checkmatedKingSquare) squareStyles[checkmatedKingSquare] = { 
    boxShadow: `inset 0 0 0 4px ${colors.error}` 
  };

  // Container styles
  const containerStyle = {
    position: 'relative',
    minHeight: 'calc(100vh - 80px)',
    backgroundColor: colors.background,
    transition: styles.transition,
    padding: '2rem'
  };

  // Button styles
  const resignButtonStyle = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    padding: '1rem 2rem',
    fontSize: '1.1rem',
    fontWeight: 600,
    backgroundColor: colors.error,
    color: '#fff',
    border: 'none',
    borderRadius: styles.buttonRadius,
    cursor: 'pointer',
    boxShadow: styles.boxShadowMedium,
    transition: styles.transition
  };

  // Player info styles
  const playerInfoContainerStyle = {
    paddingLeft: '350px',
    marginBottom: '1.5rem'
  };

  const playerNameStyle = {
    color: colors.textPrimary,
    fontSize: '1.2rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  // Chessboard container styles
  const chessboardContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: "700px",
    margin: "0 auto",
    gap: "1rem",
  };

  // Game result message styles
  const gameResultStyle = {
    textAlign: 'center',
    marginBottom: '1.5rem',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: colors.primary,
    padding: '0.75rem 1.25rem',
    borderRadius: styles.cardRadius,
    boxShadow: styles.boxShadowMedium
  };

  // Timer styles
  const timersContainerStyle = {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    fontSize: "1.1rem",
    color: colors.textPrimary,
    marginBottom: '1rem'
  };

  const timerDisplayStyle = (isActive) => ({
    padding: '0.5rem 1rem',
    backgroundColor: isActive ? colors.primary : colors.surfaceSecondary,
    color: isActive ? '#fff' : colors.textPrimary,
    borderRadius: styles.buttonRadius,
    fontWeight: isActive ? '600' : '400',
    boxShadow: isActive ? styles.boxShadowLight : 'none',
    transition: styles.transition
  });

  // Move history styles
  const moveHistoryContainerStyle = {
    marginTop: '2rem',
    maxWidth: '700px',
    backgroundColor: colors.surfacePrimary,
    borderRadius: styles.cardRadius,
    padding: '1.5rem',
    boxShadow: styles.boxShadowLight
  };

  const moveHistoryTitleStyle = {
    color: colors.primary,
    fontSize: '1.2rem',
    marginBottom: '1rem',
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: '0.5rem'
  };

  const moveListStyle = {
    color: colors.textPrimary,
    listStylePosition: 'inside',
    padding: '0 1rem',
    maxHeight: '200px',
    overflowY: 'auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.5rem'
  };

  const moveItemStyle = {
    color: colors.textPrimary,
    fontSize: '0.9rem',
    padding: '0.25rem 0.5rem',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: styles.buttonRadius,
    display: 'inline-block'
  };

  return (
    <div style={containerStyle}>
      {/* Resign button */}
      <button 
        onClick={() => socket.emit('resign', room)}
        style={resignButtonStyle}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Resign
        </span>
      </button>

      {/* Opponent info */}
      <div style={playerInfoContainerStyle}>
        {players
          .filter((player) => {
            return player.username !== currentUser.displayName;
          })
          .map((player) => (
            <div key={player.id}>
              <h3 style={playerNameStyle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke={colors.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke={colors.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {player.username}
              </h3>
            </div>
          ))}
      </div>

      <div style={chessboardContainerStyle}>
        {/* Result message */}
        {over && (
          <div style={gameResultStyle}>
            {over}
          </div>
        )}

        {/* Timers */}
        <div style={timersContainerStyle}>
          <span style={timerDisplayStyle(chess?.turn() === 'w' && !over)}>
            White: {formatTime(whiteTime)}
          </span>
          <span style={timerDisplayStyle(chess?.turn() === 'b' && !over)}>
            Black: {formatTime(blackTime)}
          </span>
        </div>

        {/* Chessboard */}
        <Chessboard
          position={position}
          onPieceDrop={onDrop}
          onSquareClick={handleSquareClick}
          customSquareStyles={squareStyles}
          boardOrientation={orientation}
          boardWidth={700}
          boardStyle={{ 
            borderRadius: styles.cardRadius, 
            boxShadow: styles.boxShadowMedium,
            border: `1px solid ${colors.border}`
          }}
          lightSquareStyle={{ backgroundColor: '#eeeed2' }}
          darkSquareStyle={{ backgroundColor: '#769656' }}
        />

        {/* Move History */}
        <div style={moveHistoryContainerStyle}>
          <h3 style={moveHistoryTitleStyle}>Move History</h3>
          {moveHistory.length > 0 ? (
            <ol style={moveListStyle}>
              {moveHistory.map((san, idx) => (
                <li key={idx} style={moveItemStyle}>{san}</li>
              ))}
            </ol>
          ) : (
            <p style={{ color: colors.textSecondary, fontStyle: 'italic' }}>
              No moves yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChessGame;
