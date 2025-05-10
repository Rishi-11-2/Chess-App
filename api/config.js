require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 8000,
  CLIENT_URL: process.env.CLIENT_URL || '*',
};
