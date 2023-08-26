import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

import { useCallback, useEffect, useMemo, useState } from "react";
import socket from "../socket";

const ChessGame = ({ players, room, orientation, cleanup }) => {
  console.log(orientation);
  const [chess, setChess] = useState();
  const [position, setPosition] = useState("start");
  useEffect(() => {
    setChess(new Chess());
  }, []);
  // because of useMemo hook chess instance is memoized such that between every re-renders
  // a new chess instance is not created
  const [over, setOver] = useState("");
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
    console.log(moveData);
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
  return (
    <>
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
        <Chessboard
          position={position}
          onPieceDrop={onDrop}
          boardOrientation={orientation}
        />
      </div>
    </>
  );
};

export default ChessGame;
