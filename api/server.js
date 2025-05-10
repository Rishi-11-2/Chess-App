const express = require("express");
const http = require("http");
const cors = require("cors");
const { PORT, CLIENT_URL } = require("./config");
const dataRoutes = require("./routes/dataRoutes");
const moveHistoryRoutes = require("./routes/moveHistoryRoutes");
const initSocket = require("./services/socketService");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: CLIENT_URL, methods: ["GET","POST","PUT","DELETE","OPTIONS"], credentials: true }));
app.options("*", cors({ origin: CLIENT_URL, methods: ["GET","POST","PUT","DELETE","OPTIONS"], credentials: true }));
app.use(express.json());

// API routes
app.use("/", dataRoutes);
app.use("/api", moveHistoryRoutes);

// Create HTTP server and initialize socket service
const server = http.createServer(app);
initSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
