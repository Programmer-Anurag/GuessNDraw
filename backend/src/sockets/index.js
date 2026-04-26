import { rooms } from "../app.js";
import { getRandomWords } from "../utils/generateRandomWord.js";
const activeRooms = new Map();

export const setupSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        //     // CREATE ROOM
        // socket.on("create_room", ({ roomCode,name }) => {

        //   const room = {
        //     players: [{ id: socket.id, name, score: 0 }],
        //     drawerIndex: 0,
        //     // word: "apple", // simple for now
        //   };

        //   activeRooms.set(roomCode, room);
        //   socket.join(roomCode);

        //   socket.emit("room_created", { roomCode, room });
        // });

        //   JOIN ROOM
        socket.on("join_room", ({ roomCode, name, isHost }) => {
            if (!rooms[roomCode]) {
                return socket.emit("error", "Room not found");
            }

            socket.join(roomCode);

            const player = {
                name,
                Id: socket.id,
                isHost,
                score: 0,
            };
            rooms[roomCode].players.push(player);

            // sussesfuuly joined
            socket.emit("joined_success", {
                player,
                players: rooms[roomCode].players,
            });

            // system message :player joined
            setTimeout(() => {
                io.to(roomCode).emit("chat_message", {
                    type: "system",
                    text: `${player.name} joined room`,
                });
            }, 100);

            io.to(roomCode).emit("players:update", rooms[roomCode].players);
            socket.emit("settings:update", rooms[roomCode].settings);
        });

        //        //update settings

        socket.on("update_settings", ({ roomCode, key, value }) => {
            if (!rooms[roomCode]) return;
            // update only that field
            rooms[roomCode].settings[key] = value;
            if (key === "round") {
                rooms[roomCode].game.maxRounds = value;
            }
            // console.log(rooms[roomCode].settings[key]);
            io.to(roomCode).emit("settings:update", rooms[roomCode].settings);
        });

        //   chat message

        socket.on("chat", ({ msg, roomCode }) => {
            // console.log(msg);
            // console.log(roomCode);
            io.to(roomCode).emit("chat_message", msg);
        });

        socket.on("start_game", ({ roomSetting, roomCode }) => {
            const room = rooms[roomCode];
            if (!room) return;
            // safety: sirf host start kare
            const player = room.players.find((p) => p.Id === socket.id);
            if (!player?.isHost) return;

            if (room.players.length < 2) {
                return socket.emit(
                    "error",
                    "At least 2 players required to start the game",
                );
            }

            // game init
            room.game.round = 1;
            room.game.maxRounds = roomSetting.rounds;
            room.game.isStarted = true;
            room.game.turnIndex = 0;
            room.game.processingTurn = false;
            const currentPlayer = room.players[room.game.turnIndex];

            io.to(roomCode).emit("started_game", {
                game: room.game,
                players: room.players,
            });

            console.log("game is started");
            console.log(currentPlayer.Id);

            io.to(roomCode).emit("turn_update", {
                playerId: currentPlayer.Id,
                currentRound: room.game.round,
                maxRounds: room.game.maxRounds,
            });
        });

        socket.on("ready_for_game", ({ roomCode, roomSetting }) => {
            const room = rooms[roomCode];
            const currentPlayer = room.players[room.game.turnIndex];
            io.to(roomCode).emit("turn_update", {
                playerId: currentPlayer.Id,
                currentRound: room.game.round,
                maxRounds: room.game.maxRounds,
            });
            io.to(currentPlayer.Id).emit("choose_word", {
                options: getRandomWords(roomSetting.wordCount),
            });
        });

        socket.on("word_chosen", ({ roomCode, word, currentTurn }) => {
            const room = rooms[roomCode];
            room.game.currentWord = word;
            const drawerId = currentTurn;

            io.to(drawerId).emit("start_drawing", {
                wordLength: word.length,
                drawerId,
                word,
            });

            socket.to(roomCode).emit("start_drawing", {
                wordLength: word.length,
                drawerId,
            });
        });

        //     // DRAWING
        socket.on("draw_start", ({ roomCode, x, y }) => {
            socket.to(roomCode).emit("draw_start", { x, y });
        });

        socket.on("drawing", ({ roomCode, x, y }) => {
            socket.to(roomCode).emit("drawing", { x, y });
        });

        socket.on("draw_end", ({ roomCode }) => {
            socket.to(roomCode).emit("draw_end");
        });

        socket.on("time_up", ({ roomCode, roomSetting }) => {
            const room = rooms[roomCode];
            if (!room) return;

            if (room.game.processingTurn) return;
            room.game.processingTurn = true;
            const currentPlayer = room.players[room.game.turnIndex];
            if (socket.id !== currentPlayer.Id) {
                room.game.processingTurn = false;
                return;
            }

            // next player
            room.game.turnIndex = (room.game.turnIndex + 1) % room.players.length;

            //  round check

            if (room.game.turnIndex === 0) {
                room.game.round += 1;
            }
            // 🏁game over
            if (room.game.round > room.game.maxRounds) {
                io.to(roomCode).emit("game_over", {
                    players: room.players,
                });
                room.game.processingTurn = false;
                return;
            }

            const nextPlayer = room.players[room.game.turnIndex];
            // clear old canvas
            io.to(roomCode).emit("clear_canvas");
            // send next turn
            io.to(roomCode).emit("turn_update", {
                playerId: nextPlayer.Id,
                currentRound: room.game.round,
                maxRounds: room.game.maxRounds,
            });
            // send word options only to drawer
            io.to(nextPlayer.Id).emit("choose_word", {
                options: getRandomWords(roomSetting.wordCount),
            });
            room.game.processingTurn = false;
        });

        // GUESS
        socket.on("guess", ({ roomCode, text }) => {
            const room = rooms[roomCode];
            if (!room) return;

            const currentWord = room.game.currentWord;
            if (!currentWord) return;

            const currentPlayer = room.players[room.game.turnIndex];

            // ❌ drawer guess nahi karega
            if (socket.id === currentPlayer.Id) return;

            const isCorrect =
                text.toLowerCase().trim() === currentWord.toLowerCase();

            if (isCorrect) {
                if (room.game.processingTurn) return;
                room.game.processingTurn = true;
                const player = room.players.find(p => p.Id === socket.id);

                if (player) {
                    player.score = (player.score || 0) + 1;
                }

                // 🟢 notify all
                io.to(roomCode).emit("correct_guess", {
                    playerId: socket.id,
                    players: room.players
                });

                // 🧠 turn skip
                io.to(roomCode).emit("time_up", { roomCode });

            } else {
                io.to(roomCode).emit("chat_message", {
                    type: "chat",
                    user: room.players.find(p => p.Id === socket.id)?.name,
                    message: text
                });
            }
        });

        //     // DISCONNECT
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);

            // 🔁 loop all rooms
            for (const roomCode in rooms) {
                const room = rooms[roomCode];

                const playerIndex = room.players.findIndex(p => p.Id === socket.id);

                if (playerIndex === -1) continue;

                const player = room.players[playerIndex];

                // remove player
                room.players.splice(playerIndex, 1);

                // system message
                io.to(roomCode).emit("chat_message", {
                    type: "system",
                    text: `${player.name} left the room`
                });

                // update players list
                io.to(roomCode).emit("players:update", room.players);
                if (room.game.isStarted) {
                    //  agar drawer hi exit kar gaya
                    const currentPlayer = room.players[room.game.turnIndex];
                    if (!currentPlayer || currentPlayer.Id === socket.id) {
                        // next turn pe shift kar
                        room.game.turnIndex =
                            room.players.length > 0
                                ? room.game.turnIndex % room.players.length
                                : 0;

                        // canvas clear
                        io.to(roomCode).emit("clear_canvas");

                        if (room.players.length > 0) {
                            const nextPlayer = room.players[room.game.turnIndex];

                            io.to(roomCode).emit("turn_update", {
                                playerId: nextPlayer.Id,
                                currentRound: room.game.round,
                                maxRounds: room.game.maxRounds
                            });
                            io.to(nextPlayer.Id).emit("choose_word", {
                                options: getRandomWords(room.settings.wordCount)
                            });
                        }
                    }
                }
                // agar room empty ho gaya → delete
                if (room.players.length === 0) {
                    delete rooms[roomCode];
                    console.log(`Room ${roomCode} deleted`);
                }

                break; // ek hi room me hoga banda
            }
        });

    });
};
