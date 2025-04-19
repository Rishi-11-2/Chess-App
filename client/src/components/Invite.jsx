import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import socket from '../socket';

export default function Invite({ roomID }) {
  const { currentUser } = useContext(AuthContext);
  const handleCopy = () => navigator.clipboard.writeText(roomID);
  return (
    <div className="Invite" style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h5>Invite others to join:</h5>
      <p style={{ fontSize: '1.2rem' }}>{roomID}</p>
      <button onClick={handleCopy} style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#31c09c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
        Copy ID
      </button>
    </div>
  );
}
