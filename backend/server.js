import { Server } from "socket.io";
import app from "./src/app.js";
import cors from "cors";
import {createServer} from "node:http"
// import { connectDB } from "./src/config/db.js";
import { configDotenv } from "dotenv";
import { setupSocket } from "./src/sockets/index.js";
configDotenv()
// connectDB();
const server=createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

setupSocket(io)
const Port=process.env.PORT;

server.listen(Port,()=>{
    console.log(`server is running on ${Port}`); 
})
