import { useState } from "react";
import { useGame } from "../context/GameContext";
import { socket } from "../socket/socket.js";
import { connectSocket } from "../socket/socket.js";

function Home() {
  const [joining, setJoining] = useState(false);
  const { setScreen, setRoom ,setPlayers} = useGame();


  async function handleCreateRoom(e) {
  e.preventDefault();

  const name = e.target.elements.name.value;
  const roomCodeInput = e.target.elements.RoomCode?.value;

   await connectSocket()

  if (joining) {
    
   await socket.emit("join_room", {
      roomCode: roomCodeInput,
      name,
      isHost:false
    });

    setRoom(roomCodeInput);
  } else {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/create-room`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player: name })
    });

    const data = await res.json();

    socket.emit("join_room", {
      roomCode: data.roomCode,
      name,
      isHost:true
    });

    setRoom(data.roomCode);
  }

 socket.on("joined_success", ({players}) => {
  setPlayers(players);
  setScreen("Room");
});
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">

        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          GuessNDraw
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleCreateRoom}>

          <input
            type="text"
            placeholder="Enter your name"
            id="name"
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex flex-col gap-3">
            {joining ? (
              <>
                <input
                  type="text"
                  id="RoomCode"
                  placeholder="Enter Room Code"
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                <button
                  type="submit"
                  className="bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                >
                  Start
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setJoining(true)}
                className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Join Room
              </button>
            )}
          </div>

          <button
            className="w-full mt-4 bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition"
          >
            Create Room
          </button>
        </form>



      </div>

    </div>
  );
}

export default Home;