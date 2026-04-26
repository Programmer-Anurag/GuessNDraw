import express from "express"
import cors from "cors"
import generateRoomCode from "./utils/generateRoomId.js";

const app = express();
app.use(cors())
app.use(express.json())
export const rooms = {};

/* This code snippet is defining a POST route in an Express application. When a POST request is made to
the "/create-room" endpoint, the server generates a unique room code using the `generateRoomCode`
function. It ensures that the generated code is not already in use as a room code. */
app.post("/create-room", (req, res) => {
    let code;
    do {
        code = generateRoomCode(6);
    } while (rooms[code]);

    //    let {player}=req.body

    rooms[code] = {
        players: [],
        settings: {
            maxPlayers: 6,
            rounds: 3,
            drawTime: 30,
            gameMode: "Normal",
            wordCount: 2,
            hint: 1,
            language: "English"
        },
        game: {
            isStarted: false,
            round: 1,
            maxRounds:3,
            turnIndex: 0,
            currentWord: "",
            processingTurn: false,
            drawer: null,
            guesses: []
        }
    };
    console.log(rooms[code]);


    res.json({ roomCode: code });
});


export default app;

