import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { ThemeContext } from '../context/ThemeContext';
import moveHistoryService from '../services/moveHistoryService';

const MoveAnalysis = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { darkMode, colors, styles } = useContext(ThemeContext);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [chess, setChess] = useState(new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [analysisNotes, setAnalysisNotes] = useState('');
  
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setLoading(true);
        const data = await moveHistoryService.getMoveHistoryById(gameId);
        setGameData(data);
        // Reset chess position
        const newChess = new Chess();
        setChess(newChess);
        setCurrentMoveIndex(-1);
      } catch (err) {
        console.error('Error fetching game data:', err);
        setError('Failed to load game data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchGameData();
    }
  }, [gameId]);

  // Navigate through moves
  const goToMove = (index) => {
    // Reset to initial position
    const newChess = new Chess();
    
    // Apply moves up to the desired index
    if (index >= 0 && gameData?.moves && index < gameData.moves.length) {
      for (let i = 0; i <= index; i++) {
        const move = gameData.moves[i];
        newChess.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion
        });
      }
    }
    
    setChess(newChess);
    setCurrentMoveIndex(index);
  };

  const goToPreviousMove = () => {
    if (currentMoveIndex > -1) {
      goToMove(currentMoveIndex - 1);
    }
  };

  const goToNextMove = () => {
    if (gameData?.moves && currentMoveIndex < gameData.moves.length - 1) {
      goToMove(currentMoveIndex + 1);
    }
  };

  // Format time for display
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  // Container styles
  const containerStyle = {
    backgroundColor: colors.background,
    color: colors.textPrimary,
    padding: '1.5rem',
    maxWidth: '1200px',
    margin: '0 auto',
    borderRadius: styles.cardRadius,
    minHeight: '80vh',
  };

  // Card styles
  const cardStyle = {
    backgroundColor: colors.surfacePrimary,
    borderRadius: styles.cardRadius,
    padding: '1.5rem',
    boxShadow: styles.boxShadowMedium,
    marginBottom: '1.5rem',
  };

  // Button styles
  const buttonStyle = (primary = false) => ({
    backgroundColor: primary ? colors.primary : colors.surfaceSecondary,
    color: primary ? '#fff' : colors.textPrimary,
    padding: '0.6rem 1.2rem',
    borderRadius: styles.buttonRadius,
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    boxShadow: styles.boxShadowLight,
    transition: styles.transition,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
  });

  if (loading) {
    return (
      <div style={{
        ...containerStyle, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: `4px solid ${colors.primary}`,
          borderBottomColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <h2>Loading game data...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        ...containerStyle,
        textAlign: 'center',
        padding: '2rem',
      }}>
        <div style={{
          backgroundColor: colors.error,
          color: '#fff',
          padding: '1rem',
          borderRadius: styles.cardRadius,
          marginBottom: '1.5rem'
        }}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => navigate('/history')} 
          style={buttonStyle(true)}
        >
          Back to History
        </button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          color: colors.primary,
          margin: 0
        }}>
          Game Analysis
        </h2>
        <button 
          onClick={() => navigate('/history')} 
          style={buttonStyle(true)}
        >
          <span>←</span> Back to History
        </button>
      </div>
      
      {gameData && (
        <>
          <div style={cardStyle}>
            <h3 style={{ 
              color: colors.textPrimary, 
              borderBottom: `1px solid ${colors.border}`,
              paddingBottom: '0.5rem',
              marginBottom: '1rem'
            }}>
              Game Details
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <p style={{ margin: '0.5rem 0' }}>
                  <span style={{ color: colors.textSecondary }}>White:</span>{' '}
                  <strong>{gameData.playerWhite}</strong>
                </p>
                <p style={{ margin: '0.5rem 0' }}>
                  <span style={{ color: colors.textSecondary }}>Black:</span>{' '}
                  <strong>{gameData.playerBlack}</strong>
                </p>
              </div>
              <div>
                <p style={{ margin: '0.5rem 0' }}>
                  <span style={{ color: colors.textSecondary }}>Date:</span>{' '}
                  {formatTime(gameData.date)}
                </p>
                <p style={{ margin: '0.5rem 0' }}>
                  <span style={{ color: colors.textSecondary }}>Time Control:</span>{' '}
                  {gameData.timeControl} minutes
                </p>
              </div>
              <div>
                <p style={{ margin: '0.5rem 0' }}>
                  <span style={{ color: colors.textSecondary }}>Result:</span>{' '}
                  <span style={{
                    fontWeight: 'bold',
                    color: 
                      gameData.result === 'Win' ? colors.success :
                      gameData.result === 'Loss' ? colors.error :
                      colors.warning
                  }}>
                    {gameData.result}
                  </span>
                </p>
                <p style={{ margin: '0.5rem 0' }}>
                  <span style={{ color: colors.textSecondary }}>Total Moves:</span>{' '}
                  {gameData.moves?.length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            {/* Chessboard */}
            <div style={{ 
              flex: '1', 
              minWidth: '320px',
              ...cardStyle,
              marginBottom: 0
            }}>
              <div style={{
                boxShadow: styles.boxShadowMedium,
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <Chessboard 
                  position={chess.fen()} 
                  boardWidth={Math.min(500, window.innerWidth - 40)}
                  arePiecesDraggable={false}
                  customDarkSquareStyle={{ backgroundColor: darkMode ? '#4A5568' : '#B8C2CC' }}
                  customLightSquareStyle={{ backgroundColor: darkMode ? '#718096' : '#F1F5F9' }}
                />
              </div>
              
              <div style={{ 
                marginTop: '1rem', 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <button 
                  onClick={() => goToMove(-1)} 
                  style={{
                    ...buttonStyle(),
                    padding: '0.5rem',
                    minWidth: '40px',
                    justifyContent: 'center'
                  }}
                >
                  ⏮
                </button>
                <button 
                  onClick={goToPreviousMove} 
                  disabled={currentMoveIndex === -1} 
                  style={{
                    ...buttonStyle(),
                    padding: '0.5rem',
                    minWidth: '40px',
                    justifyContent: 'center',
                    opacity: currentMoveIndex === -1 ? 0.5 : 1
                  }}
                >
                  ◀
                </button>
                <button 
                  onClick={goToNextMove} 
                  disabled={!gameData.moves || currentMoveIndex >= gameData.moves.length - 1}
                  style={{
                    ...buttonStyle(),
                    padding: '0.5rem',
                    minWidth: '40px',
                    justifyContent: 'center',
                    opacity: (!gameData.moves || currentMoveIndex >= gameData.moves.length - 1) ? 0.5 : 1
                  }}
                >
                  ▶
                </button>
                <button 
                  onClick={() => goToMove(gameData.moves?.length - 1)} 
                  disabled={!gameData.moves || gameData.moves.length === 0}
                  style={{
                    ...buttonStyle(),
                    padding: '0.5rem',
                    minWidth: '40px',
                    justifyContent: 'center',
                    opacity: (!gameData.moves || gameData.moves.length === 0) ? 0.5 : 1
                  }}
                >
                  ⏭
                </button>
              </div>
              
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: colors.surfaceSecondary,
                borderRadius: styles.buttonRadius,
                fontSize: '0.9rem'
              }}>
                <p>
                  <span style={{ color: colors.textSecondary }}>Current position:</span>
                  {chess.isCheck() && <span style={{ color: colors.error, fontWeight: 'bold' }}> Check!</span>}
                  {chess.isCheckmate() && <span style={{ color: colors.error, fontWeight: 'bold' }}> Checkmate!</span>}
                  {chess.isDraw() && <span style={{ color: colors.warning, fontWeight: 'bold' }}> Draw!</span>}
                  {chess.isStalemate() && <span style={{ color: colors.warning, fontWeight: 'bold' }}> Stalemate!</span>}
                </p>
                <p style={{ 
                  fontSize: '0.8rem', 
                  fontFamily: 'monospace', 
                  marginTop: '0.5rem',
                  wordBreak: 'break-all',
                  color: colors.textSecondary
                }}>
                  FEN: {chess.fen()}
                </p>
              </div>
            </div>
            
            {/* Move list and analysis */}
            <div style={{ 
              flex: '1', 
              minWidth: '320px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              <div style={cardStyle}>
                <h3 style={{ 
                  color: colors.textPrimary, 
                  borderBottom: `1px solid ${colors.border}`,
                  paddingBottom: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  Move History
                </h3>
                <div style={{ 
                  height: '240px', 
                  overflowY: 'auto', 
                  borderRadius: styles.buttonRadius,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.surfaceSecondary
                }}>
                  {gameData.moves && gameData.moves.length > 0 ? (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'auto 1fr 1fr',
                      gap: '0.25rem 0.5rem'
                    }}>
                      {gameData.moves.map((move, idx) => {
                        // Create new row for each pair of moves (white and black)
                        if (idx % 2 === 0) {
                          const moveNumber = Math.floor(idx / 2) + 1;
                          const whiteMoveStyle = {
                            padding: '0.5rem',
                            cursor: 'pointer',
                            backgroundColor: currentMoveIndex === idx 
                              ? (darkMode ? colors.primaryDark : colors.primaryLight)
                              : 'transparent',
                            borderRadius: '4px',
                            color: currentMoveIndex === idx ? '#fff' : colors.textPrimary,
                            fontWeight: currentMoveIndex === idx ? 'bold' : 'normal'
                          };
                          
                          // Black move (if exists)
                          const blackIdx = idx + 1;
                          const blackMove = blackIdx < gameData.moves.length ? gameData.moves[blackIdx] : null;
                          const blackMoveStyle = {
                            padding: '0.5rem',
                            cursor: blackMove ? 'pointer' : 'default',
                            backgroundColor: currentMoveIndex === blackIdx 
                              ? (darkMode ? colors.primaryDark : colors.primaryLight)
                              : 'transparent',
                            borderRadius: '4px',
                            color: currentMoveIndex === blackIdx ? '#fff' : colors.textPrimary,
                            fontWeight: currentMoveIndex === blackIdx ? 'bold' : 'normal'
                          };
                          
                          return (
                            <React.Fragment key={idx}>
                              {/* Move number */}
                              <div style={{ 
                                padding: '0.5rem', 
                                color: colors.textSecondary,
                                textAlign: 'right',
                                fontWeight: 'bold'
                              }}>
                                {moveNumber}.
                              </div>
                              
                              {/* White move */}
                              <div 
                                onClick={() => goToMove(idx)}
                                style={whiteMoveStyle}
                              >
                                {move.san}
                              </div>
                              
                              {/* Black move (if exists) */}
                              <div 
                                onClick={blackMove ? () => goToMove(blackIdx) : undefined}
                                style={blackMoveStyle}
                              >
                                {blackMove?.san || ''}
                              </div>
                            </React.Fragment>
                          );
                        }
                        return null; // Skip odd indexes as they're handled with the even indexes
                      })}
                    </div>
                  ) : (
                    <p style={{ padding: '1rem', textAlign: 'center', color: colors.textSecondary }}>
                      No moves recorded for this game.
                    </p>
                  )}
                </div>
              </div>
              
              <div style={cardStyle}>
                <h3 style={{ 
                  color: colors.textPrimary, 
                  borderBottom: `1px solid ${colors.border}`,
                  paddingBottom: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  Analysis Notes
                </h3>
                <textarea
                  value={analysisNotes}
                  onChange={(e) => setAnalysisNotes(e.target.value)}
                  style={{
                    width: '100%',
                    height: '150px',
                    padding: '0.75rem',
                    backgroundColor: colors.surfaceSecondary,
                    color: colors.textPrimary,
                    border: `1px solid ${colors.border}`,
                    borderRadius: styles.buttonRadius,
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                  placeholder="Add your analysis notes here... (e.g., identify mistakes, missed opportunities, or strengths)"
                />
              </div>
              
              <div style={cardStyle}>
                <h3 style={{ 
                  color: colors.textPrimary, 
                  borderBottom: `1px solid ${colors.border}`,
                  paddingBottom: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  Position Evaluation
                </h3>
                {(() => {
                  // Calculate material balance
                  const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9 };
                  let whiteMaterial = 0;
                  let blackMaterial = 0;
                  
                  const board = chess.board();
                  for (let i = 0; i < 8; i++) {
                    for (let j = 0; j < 8; j++) {
                      const piece = board[i][j];
                      if (piece) {
                        const value = pieceValues[piece.type.toLowerCase()];
                        if (piece.color === 'w') {
                          whiteMaterial += value;
                        } else {
                          blackMaterial += value;
                        }
                      }
                    }
                  }
                  
                  const advantage = whiteMaterial - blackMaterial;
                  let materialMessage, materialColor;
                  
                  if (advantage > 0) {
                    materialMessage = `White is ahead by ${advantage} points`;
                    materialColor = colors.primary;
                  } else if (advantage < 0) {
                    materialMessage = `Black is ahead by ${Math.abs(advantage)} points`;
                    materialColor = darkMode ? '#888' : '#333';
                  } else {
                    materialMessage = 'Material is equal';
                    materialColor = colors.textSecondary;
                  }
                  
                  return (
                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem',
                        padding: '0.75rem',
                        backgroundColor: colors.surfaceSecondary,
                        borderRadius: styles.buttonRadius
                      }}>
                        <div>
                          <span style={{ color: colors.textSecondary }}>White: </span>
                          <strong>{whiteMaterial} points</strong>
                        </div>
                        <div style={{ 
                          fontWeight: 'bold',
                          color: materialColor
                        }}>
                          {materialMessage}
                        </div>
                        <div>
                          <span style={{ color: colors.textSecondary }}>Black: </span>
                          <strong>{blackMaterial} points</strong>
                        </div>
                      </div>
                      
                      <div style={{
                        backgroundColor: colors.surfaceSecondary,
                        padding: '0.75rem',
                        borderRadius: styles.buttonRadius,
                        marginBottom: '0.5rem'
                      }}>
                        <p style={{ margin: 0 }}>
                          <span style={{ color: colors.textSecondary }}>Turn: </span>
                          <strong>{chess.turn() === 'w' ? 'White' : 'Black'}</strong>
                        </p>
                      </div>
                      
                      <div style={{
                        backgroundColor: colors.surfaceSecondary,
                        padding: '0.75rem',
                        borderRadius: styles.buttonRadius
                      }}>
                        <p style={{ margin: 0 }}>
                          <span style={{ color: colors.textSecondary }}>Move: </span>
                          <strong>{Math.floor(chess.moveNumber()) + (chess.turn() === 'b' ? 0.5 : 0)}</strong>
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MoveAnalysis;
