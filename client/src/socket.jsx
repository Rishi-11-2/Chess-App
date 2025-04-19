import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
const socket = io(SERVER_URL, { transports: ["websocket"] });

export default socket;
