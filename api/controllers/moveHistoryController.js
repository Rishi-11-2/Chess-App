const fs = require('fs');
const path = require('path');

// Ensure the moves directory exists
const MOVES_DIR = path.join(__dirname, '../data/moves');
if (!fs.existsSync(MOVES_DIR)) {
  fs.mkdirSync(MOVES_DIR, { recursive: true });
}

/**
 * Save a game's move history to a JSON file
 */
exports.saveMoveHistory = (req, res) => {
  try {
    const { gameId, playerWhite, playerBlack, timeControl, moveHistory, result, date } = req.body;
    
    if (!gameId || !playerWhite || !playerBlack || !moveHistory) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const fileName = `${gameId}.json`;
    const filePath = path.join(MOVES_DIR, fileName);
    
    const gameData = {
      gameId,
      date: date || new Date().toISOString(),
      playerWhite,
      playerBlack,
      timeControl,
      result,
      moves: moveHistory,
    };
    
    fs.writeFileSync(filePath, JSON.stringify(gameData, null, 2));
    
    return res.status(200).json({ 
      success: true, 
      message: 'Move history saved successfully',
      filePath: fileName 
    });
  } catch (error) {
    console.error('Error saving move history:', error);
    return res.status(500).json({ error: 'Failed to save move history' });
  }
};

/**
 * Get move history by game ID
 */
exports.getMoveHistoryById = (req, res) => {
  try {
    const gameId = req.params.gameId;
    
    if (!gameId) {
      return res.status(400).json({ error: 'Game ID is required' });
    }
    
    const filePath = path.join(MOVES_DIR, `${gameId}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Move history not found' });
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const moveData = JSON.parse(fileContent);
    
    return res.status(200).json(moveData);
  } catch (error) {
    console.error('Error retrieving move history:', error);
    return res.status(500).json({ error: 'Failed to retrieve move history' });
  }
};

/**
 * Get all move histories for a specific player
 */
exports.getPlayerMoveHistories = (req, res) => {
  try {
    const playerName = req.params.playerName;
    
    if (!playerName) {
      return res.status(400).json({ error: 'Player name is required' });
    }
    
    const files = fs.readdirSync(MOVES_DIR);
    const playerGames = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(MOVES_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const gameData = JSON.parse(fileContent);
        
        if (gameData.playerWhite === playerName || gameData.playerBlack === playerName) {
          playerGames.push({
            gameId: gameData.gameId,
            date: gameData.date,
            opponent: gameData.playerWhite === playerName ? gameData.playerBlack : gameData.playerWhite,
            result: gameData.result,
            timeControl: gameData.timeControl,
            playerColor: gameData.playerWhite === playerName ? 'white' : 'black'
          });
        }
      }
    }
    
    // Sort by date (newest first)
    playerGames.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return res.status(200).json(playerGames);
  } catch (error) {
    console.error('Error retrieving player move histories:', error);
    return res.status(500).json({ error: 'Failed to retrieve player move histories' });
  }
};
