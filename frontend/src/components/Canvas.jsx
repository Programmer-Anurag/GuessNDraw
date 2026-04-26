import { useRef, useEffect, useState } from "react";

export default function Canvas({ socket, roomCode, roomSetting }) {

    // 🧠 STATE
    const [gameState, setGameState] = useState({
        phase: "waiting",
        currentTurn: 0,
        wordLength: 0,
        currentRound: 1,
        isDrawer: false,
        wordOptions: [],
        word: ""
    });

    const { phase, isDrawer, wordLength, wordOptions, currentTurn, currentRound } = gameState;

    const [time, setTime] = useState(roomSetting.drawTime);

    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [drawing, setDrawing] = useState(false);



    // 🎨 CANVAS SETUP
    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = 900;
        canvas.height = 500;

        const ctx = canvas.getContext("2d");
        ctx.lineCap = "round";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "black";

        ctxRef.current = ctx;
    }, []);

    // 🟢 DRAW EVENTS
    const startDrawing = (e) => {
        if (!isDrawer) return;

        const { offsetX, offsetY } = e.nativeEvent;

        ctxRef.current.beginPath();
        ctxRef.current.moveTo(offsetX, offsetY);

        socket.emit("draw_start", { roomCode, x: offsetX, y: offsetY });

        setDrawing(true);
    };

    const draw = (e) => {
        if (!drawing || !isDrawer) return;

        const { offsetX, offsetY } = e.nativeEvent;

        ctxRef.current.lineTo(offsetX, offsetY);
        ctxRef.current.stroke();

        socket.emit("drawing", { roomCode, x: offsetX, y: offsetY });
    };

    const stopDrawing = () => {
        if (!isDrawer) return;

        ctxRef.current.closePath();
        setDrawing(false);

        socket.emit("draw_end", { roomCode });
    };

    // 🔵 RECEIVE DRAW
    useEffect(() => {
        socket.on("draw_start", ({ x, y }) => {
            ctxRef.current.beginPath();
            ctxRef.current.moveTo(x, y);
        });

        socket.on("drawing", ({ x, y }) => {
            ctxRef.current.lineTo(x, y);
            ctxRef.current.stroke();
        });

        socket.on("draw_end", () => {
            ctxRef.current.closePath();
        });

        socket.on("clear_canvas", () => {
            ctxRef.current.clearRect(0, 0, 900, 500);
        });

        return () => {
            socket.off("draw_start");
            socket.off("drawing");
            socket.off("draw_end");
            socket.off("clear_canvas");
        };
    }, [socket]);

    // 🧹 CLEAR
    const clearCanvas = () => {
        if (!isDrawer) return;

        ctxRef.current.clearRect(0, 0, 900, 500);
        socket.emit("clear_canvas", { roomCode });
    };


    // 🎮 GAME EVENTS
    useEffect(() => {

        const handleTurnUpdate = ({ playerId, currentRound }) => {

            console.log("turn update", playerId);

            setGameState(prev => ({

                ...prev,

                currentTurn: playerId,
                currentRound: currentRound ?? prev.currentRound,
                isDrawer: socket.id === playerId,
                phase: "choosing"

            }));


        };

        socket.on("turn_update", handleTurnUpdate);



        socket.on("choose_word", ({ options }) => {
            console.log(options, currentTurn);

            setGameState(prev => ({
                ...prev,
                wordOptions: options,
                wordLength: options.length,
                phase: "choosing"
            }));
        });

        socket.on("start_drawing", ({ word, wordLength, drawerId }) => {
            setGameState(prev => ({
                ...prev,
                phase: "drawing",
                wordLength,
                isDrawer: socket.id === drawerId,
                word: word
            }));
        });

        return () => {
            socket.off("turn_update", handleTurnUpdate);
            socket.off("choose_word");
            socket.off("start_drawing");
        };
    }, [socket]);


    useEffect(() => {
        socket.emit("ready_for_game", { roomCode,roomSetting });
    }, [socket]);

    // ⏱ TIMER
    useEffect(() => {
        if (phase !== "drawing") return;
        setTime(roomSetting.drawTime);

        const interval = setInterval(() => {
            setTime(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    socket.emit("time_up", { roomCode, roomSetting })
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [phase, roomSetting.drawTime]);

    useEffect(() => {

        socket.on("game_over", ({ players }) => {
            setGameState(prev => ({
                ...prev,
                phase: "game_over"
            }));
            console.log("Game Over", players);
        });
        return () => socket.off("game_over");
    }, []);

    return (
        <div className="relative flex flex-col h-full w-full">

            {/* 🔝 TOP BAR */}
            <div className="flex justify-between items-center bg-gray-200 px-4 py-2 rounded-t-xl shadow-sm">

                <span className="font-semibold text-gray-700">
                    {`Round ${currentRound}/${roomSetting.rounds}`}
                </span>

                <span className="font-bold text-lg text-gray-800">
                    ⏱ {time}s
                </span>

                <span className="tracking-widest font-mono text-lg">
                    {phase === "drawing" &&
                        (isDrawer
                            ? gameState.word
                            : "_ ".repeat(wordLength))}
                </span>

            </div>

            {/* 🟡 WORD CHOOSE OVERLAY */}
            {phase === "choosing" && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">

                    {isDrawer ? (
                        <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">

                            <h2 className="text-lg font-semibold text-gray-700">
                                Choose a word
                            </h2>

                            {wordOptions.length > 0 ? (
                                <div className="flex gap-3">
                                    {wordOptions.map((word) => (
                                        <button
                                            key={word}
                                            onClick={() => socket.emit("word_chosen", { roomCode, word, currentTurn })}
                                            className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition hover:scale-105 active:scale-95"
                                        >
                                            {word}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-gray-500">Loading...</span>
                            )}

                        </div>
                    ) : (
                        <div className="text-white text-xl font-semibold animate-pulse">
                            Player is choosing a word...
                        </div>
                    )}

                </div>
            )}

            {phase === "game_over" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-3xl font-bold">
                    Game Over
                </div>

            )}

            {/* 🎨 CANVAS */}
            <div className="flex-1 flex justify-center items-center bg-gray-100">

                <canvas
                    ref={canvasRef}
                    className="bg-white border rounded-xl shadow-md"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                />

            </div>

            {/* 🧰 TOOLBAR */}
            <div className="flex justify-between items-center px-4 py-2 bg-gray-200 rounded-b-xl">

                <div className="flex gap-2">
                    <button className="w-6 h-6 bg-black rounded-full" />
                    <button className="w-6 h-6 bg-red-500 rounded-full" />
                    <button className="w-6 h-6 bg-blue-500 rounded-full" />
                </div>

                {isDrawer && (
                    <button
                        onClick={clearCanvas}
                        className="px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition"
                    >
                        Clear
                    </button>
                )}

            </div>

        </div>
    );
}