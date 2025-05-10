import axios from 'axios';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';

/**
 * Service for interacting with move history API endpoints
 */
const moveHistoryService = {
  /**
   * Save a game's move history
   * @param {Object} gameData - Game data with moves
   * @returns {Promise} - Promise with response
   */
  saveGameMoves: async (gameData) => {
    try {
      const response = await axios.post(`${API_URL}/api/moves`, gameData);
      return response.data;
    } catch (error) {
      console.error('Error saving game moves:', error);
      throw error;
    }
  },
  
  /**
   * Get move history by game ID
   * @param {string} gameId - Game ID
   * @returns {Promise} - Promise with move history data
   */
  getMoveHistoryById: async (gameId) => {
    try {
      const response = await axios.get(`${API_URL}/api/moves/${gameId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting move history:', error);
      throw error;
    }
  },
  
  /**
   * Get all move histories for a player
   * @param {string} playerName - Player's name
   * @returns {Promise} - Promise with player's game histories
   */
  getPlayerMoveHistories: async (playerName) => {
    try {
      const response = await axios.get(`${API_URL}/api/moves/player/${playerName}`);
      return response.data;
    } catch (error) {
      console.error('Error getting player move histories:', error);
      throw error;
    }
  }
};

export default moveHistoryService;
