import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";
import moveHistoryService from "../services/moveHistoryService";
import { ThemeContext } from "../context/ThemeContext";

export default function History() {
  const { currentUser } = useContext(AuthContext);
  const { colors, styles } = useContext(ThemeContext);
  const [history, setHistory] = useState([]);
  const [detailedHistory, setDetailedHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser?.displayName) return;
    
    const fetchHistory = async () => {
      try {
        setLoading(true);
        
        // Fetch Firestore match history
        const snapshot = await getDocs(collection(db, "matchHistory"));
        let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data = data.filter(item => item.player === currentUser.displayName);
        // Sort by Firestore timestamp (seconds) descending
        data.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
        setHistory(data);
        
        // Fetch detailed move history
        try {
          const detailedData = await moveHistoryService.getPlayerMoveHistories(currentUser.displayName);
          setDetailedHistory(detailedData);
        } catch (error) {
          console.error("Error fetching detailed history", error);
          // Continue even if detailed history fails - we still have basic history
        }
        
        setLoading(false);
      } catch (e) {
        console.error("Error fetching history", e);
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [currentUser]);

  // Combine histories for display - prioritize entries with move data
  const getCombinedHistory = () => {
    const combined = [...history];
    
    // Add entries from detailedHistory that aren't already in history
    if (detailedHistory.length > 0) {
      for (const detailedGame of detailedHistory) {
        // Check if this game is in our basic history by comparing date and opponent
        const existingIndex = combined.findIndex(h => 
          h.opponent === detailedGame.opponent && 
          Math.abs((h.date?.seconds || 0) * 1000 - new Date(detailedGame.date).getTime()) < 60000
        );
        
        if (existingIndex >= 0) {
          // Add gameId to existing entry for linking to analysis
          combined[existingIndex].gameId = detailedGame.gameId;
        } else {
          // Add as new entry if not found
          combined.push({
            opponent: detailedGame.opponent,
            result: detailedGame.result,
            timeControl: detailedGame.timeControl,
            date: { toDate: () => new Date(detailedGame.date) },
            gameId: detailedGame.gameId
          });
        }
      }
      
      // Re-sort combined list
      combined.sort((a, b) => {
        const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : a.date.toDate();
        const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : b.date.toDate();
        return dateB - dateA;
      });
    }
    
    return combined;
  };

  // Container styles
  const containerStyle = {
    padding: "2rem",
    maxWidth: "1000px",
    margin: "0 auto",
    backgroundColor: colors.background,
    color: colors.textPrimary,
    minHeight: "calc(100vh - 80px)"
  };

  // Header styles
  const headerStyle = {
    color: colors.primary,
    marginBottom: "1.5rem",
    fontSize: "2rem",
    borderBottom: `2px solid ${colors.primary}`,
    paddingBottom: "0.5rem"
  };

  // Button styles
  const buttonStyle = {
    marginBottom: "1.5rem",
    padding: "0.75rem 1.5rem",
    backgroundColor: colors.primary,
    color: "#fff",
    border: "none",
    borderRadius: styles.buttonRadius,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    boxShadow: styles.boxShadowLight,
    transition: styles.transition,
    fontWeight: "500",
    fontSize: "1rem"
  };

  // Table styles
  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: colors.surfacePrimary,
    boxShadow: styles.boxShadowMedium,
    borderRadius: styles.cardRadius,
    overflow: "hidden"
  };

  // Table head styles
  const tableHeadStyle = {
    backgroundColor: colors.primary,
    color: "#fff"
  };

  // Table header cell styles
  const tableHeaderCellStyle = {
    padding: "1rem",
    textAlign: "left",
    fontWeight: "500"
  };

  // Table row styles
  const tableRowStyle = (index) => ({
    backgroundColor: index % 2 === 0 
      ? colors.surfaceSecondary
      : colors.surfacePrimary
  });

  // Table cell styles
  const tableCellStyle = {
    padding: "1rem",
    borderBottom: `1px solid ${colors.border}`,
    color: colors.textPrimary
  };

  // Result cell styles
  const getResultCellStyle = (result) => ({
    ...tableCellStyle,
    fontWeight: "bold",
    color: 
      result === "Win" ? colors.success :
      result === "Loss" ? colors.error :
      colors.warning
  });

  // Analysis button styles
  const analysisButtonStyle = {
    padding: "0.5rem 1rem",
    backgroundColor: colors.secondary,
    color: "#fff",
    border: "none",
    borderRadius: styles.buttonRadius,
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "0.9rem",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    boxShadow: styles.boxShadowLight,
    transition: styles.transition
  };

  // Info box styles
  const infoBoxStyle = {
    marginTop: "2rem",
    padding: "1.5rem",
    backgroundColor: colors.surfacePrimary,
    borderRadius: styles.cardRadius,
    boxShadow: styles.boxShadowLight,
    border: `1px solid ${colors.border}`
  };

  // Loading spinner styles
  const loadingContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  };

  const spinnerStyle = {
    width: '40px',
    height: '40px',
    border: `4px solid ${colors.border}`,
    borderTopColor: colors.primary,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Match History</h2>
      
      <button 
        onClick={() => navigate(-1)} 
        style={buttonStyle}
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: 0.9 }}
        >
          <path 
            d="M19 12H5" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M12 19L5 12L12 5" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
        Back to Home
      </button>
      
      {loading ? (
        <div style={loadingContainerStyle}>
          <div style={spinnerStyle}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ marginLeft: '1rem', color: colors.textSecondary }}>
            Loading your game history...
          </p>
        </div>
      ) : getCombinedHistory().length ? (
        <table style={tableStyle}>
          <thead style={tableHeadStyle}>
            <tr>
              <th style={tableHeaderCellStyle}>Date</th>
              <th style={tableHeaderCellStyle}>Opponent</th>
              <th style={tableHeaderCellStyle}>Result</th>
              <th style={tableHeaderCellStyle}>Time</th>
              <th style={tableHeaderCellStyle}>Analysis</th>
            </tr>
          </thead>
          <tbody>
            {getCombinedHistory().map((item, index) => (
              <tr 
                key={item.id || `game-${index}`} 
                style={tableRowStyle(index)}
              >
                <td style={tableCellStyle}>
                  {item.date.toDate().toLocaleString()}
                </td>
                <td style={tableCellStyle}>
                  {item.opponent}
                </td>
                <td style={getResultCellStyle(item.result)}>
                  {item.result}
                </td>
                <td style={tableCellStyle}>
                  {item.timeControl} min
                </td>
                <td style={tableCellStyle}>
                  {item.gameId ? (
                    <button
                      onClick={() => navigate(`/analysis/${item.gameId}`)}
                      style={analysisButtonStyle}
                    >
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          d="M2 12H4M20 12H22M12 2V4M12 20V22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93M10 12C10 11.4696 10.2107 10.9609 10.5858 10.5858C10.9609 10.2107 11.4696 10 12 10C12.5304 10 13.0391 10.2107 13.4142 10.5858C13.7893 10.9609 14 11.4696 14 12C14 12.5304 13.7893 13.0391 13.4142 13.4142C13.0391 13.7893 12.5304 14 12 14C11.4696 14 10.9609 13.7893 10.5858 13.4142C10.2107 13.0391 10 12.5304 10 12Z" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                      View Analysis
                    </button>
                  ) : (
                    <span style={{ 
                      color: colors.textSecondary,
                      fontSize: "0.9rem",
                      fontStyle: "italic"
                    }}>
                      No Data
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{
          padding: "2rem",
          textAlign: "center",
          backgroundColor: colors.surfacePrimary,
          borderRadius: styles.cardRadius,
          color: colors.textSecondary
        }}>
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ 
              margin: "0 auto", 
              display: "block", 
              marginBottom: "1rem",
              opacity: 0.5
            }}
          >
            <path 
              d="M10 3H3V10H10V3Z" 
              stroke={colors.textSecondary} 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M21 3H14V10H21V3Z" 
              stroke={colors.textSecondary} 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M21 14H14V21H21V14Z" 
              stroke={colors.textSecondary} 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M10 14H3V21H10V14Z" 
              stroke={colors.textSecondary} 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <p>No match history yet. Start playing to build your record!</p>
        </div>
      )}
      
      <div style={infoBoxStyle}>
        <h3 style={{ 
          color: colors.primary, 
          marginBottom: "1rem",
          borderBottom: `1px solid ${colors.border}`,
          paddingBottom: "0.5rem"
        }}>
          About Game Analysis
        </h3>
        <p>Games with detailed move history can be analyzed to help identify patterns and areas for improvement.</p>
        <p>Analyzing your moves can help you:</p>
        <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
          <li>Identify recurring mistakes</li>
          <li>Improve your opening repertoire</li>
          <li>Find missed tactical opportunities</li>
          <li>Better understand your play style</li>
        </ul>
        <p style={{ 
          fontStyle: "italic", 
          color: colors.textSecondary,
          fontSize: "0.9rem",
          marginTop: "1rem",
          padding: "0.5rem",
          backgroundColor: colors.surfaceSecondary,
          borderRadius: styles.buttonRadius
        }}>
          Note: Only games played after this feature was added will have detailed move analysis available.
        </p>
      </div>
    </div>
  );
}
