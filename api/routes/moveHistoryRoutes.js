const router = require("express").Router();
const { 
  saveMoveHistory, 
  getMoveHistoryById, 
  getPlayerMoveHistories 
} = require("../controllers/moveHistoryController");

// Save move history
router.post("/moves", saveMoveHistory);

// Get move history by game ID
router.get("/moves/:gameId", getMoveHistoryById);

// Get all move histories for a player
router.get("/moves/player/:playerName", getPlayerMoveHistories);

module.exports = router;
