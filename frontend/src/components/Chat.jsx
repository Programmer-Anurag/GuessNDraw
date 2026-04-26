import { useEffect, useState } from "react";

export default function Chat({ socket, username, roomCode }) {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);

    useEffect(() => {
        socket.on("chat_message", (msg) => {
            console.log(msg);
            setChat((prev) => [...prev, msg]);
        });

        return () => socket.off("chat_message");
    }, [socket, setChat]);

    const sendMessage = () => {
        if (!message.trim()) return;

        const msg = {
            type: "chat",
            user: username,
            message: message,
            time: new Date().toLocaleTimeString()
        };

        socket.emit("guess", {
            roomCode,
            text: msg.message

        });
        setMessage("");
    };

    return (
        <div className="flex flex-col h-full border rounded-lg bg-white">

            {/* CHAT AREA */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">

                {chat.map((msg, index) => {

                    // SYSTEM MESSAGE
                    if (msg.type === "system") {
                        return (
                            <div key={index} className="text-center text-gray-400 text-sm">
                                {msg.text}
                            </div>
                        );
                    }

                    // USER MESSAGE
                    return (
                        <div
                            key={index}
                            className={`flex ${msg.user === username ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div className="max-w-xs px-3 py-2 rounded-lg shadow text-sm bg-gray-100">
                                <p className="font-semibold">{msg.user}</p>
                                <p>{msg.message}</p>
                                {/* <p className="text-xs text-gray-500 text-right">
                                    {msg.time}
                                </p> */}
                            </div>
                        </div>
                    );
                })}

            </div>

            {/* INPUT */}
            <div className="flex border-t p-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-2 py-1 border rounded outline-none"
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />

                <button
                    onClick={sendMessage}
                    className="ml-2 px-4 py-1 bg-blue-500 text-white rounded"
                >
                    Send
                </button>
            </div>
        </div>
    );
}