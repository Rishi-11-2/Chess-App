import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";

export default function History() {
  const { currentUser } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser?.displayName) return;
    (async () => {
      try {
        // Query by player only; sort client-side to avoid composite index errors
        const q = query(
          collection(db, "matchHistory"),
          where("player", "==", currentUser.displayName)
        );
        const snapshot = await getDocs(q);
        let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by Firestore timestamp (seconds) descending
        data.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
        setHistory(data);
      } catch (e) {
        console.error("Error fetching history", e);
      }
    })();
  }, [currentUser]);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Match History</h2>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "20px" }}>Back</button>
      {history.length ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Date</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Opponent</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Result</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Time Control</th>
            </tr>
          </thead>
          <tbody>
            {history.map(item => (
              <tr key={item.id}>
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                  {new Date(item.date.toDate()).toLocaleString()}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                  {item.opponent}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                  {item.result}
                </td>
                <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                  {item.timeControl} min
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No match history.</p>
      )}
    </div>
  );
}
