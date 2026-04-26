import PlayerList from "./PlayerList";
import Chat from "./Chat";
import Canvas from "./Canvas";
import { useGame } from "../context/GameContext";
import { useEffect, useState } from "react";
import { socket } from "../socket/socket";

export default function Room() {
  const [settings, setSettings] = useState({
    maxPlayers: 6,
    rounds: 3,
    drawTime: 30,
    gameMode: "Normal",
    wordCount: 2,
    hint: 1,
    language: "English"
  });
  const { setPlayers, players, room, screen, setScreen } = useGame();

  // console.log("RENDER SCREEN:", screen);
  const isHost = players.find((p) => p.Id === socket.id)?.isHost;
  const currentPlayer = players.find(p => p.Id === socket.id);
  const username = currentPlayer?.name;

  function handleChange(e) {

    const { id, value } = e.target;
    // console.log(id);


    setSettings(prev => ({
      ...prev,
      [id]: value
    }));

    socket.emit("update_settings", {
      roomCode: room,
      key: id,
      value
    });

  }

  useEffect(() => {
    socket.on("players:update", (playersList) => {
      // console.log("RECEIVED:", playersList);
      setPlayers(playersList);
    });

    return () => socket.off("players:update");
  }, [setPlayers]);

  useEffect(() => {
    socket.on("settings:update", (newSettings) => {
      console.log("setting update");
      console.log(newSettings);
      setSettings(newSettings);
    });

    return () => socket.off("settings:update");
  }, [setSettings]);


  useEffect(() => {
  //   const handler = ({ game }) => {
  //   if (game.isStarted) {
  //     setScreen("Game");
  //   }
  // };
  socket.on("started_game", ({game})=>{
    console.log(game.isStarted);
    
    if (game.isStarted) {
      setScreen("Game");
    }
  });

  return () => socket.off("started_game");
  }, [setScreen]);


  function handleSubmit() {
    socket.emit("start_game", {
      roomSetting:settings,
      roomCode: room
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex gap-4">
      {/* LEFT → PlayerList */}
      <div className="w-1/4 bg-white rounded-2xl shadow p-4">
        <h2 className="text-xl font-semibold mb-3">Players</h2>
        <PlayerList socket={socket}/>
      </div>

      {/* CENTER → Settings / Canvas */}
      <div className="w-2/4 bg-white rounded-2xl shadow p-6 flex flex-col ">
        {(screen === "Room") && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Room Settings
            </h2>

            <div className="flex flex-col gap-3">
              {[
                { label: "Players", id: "maxPlayers", options: [2, 3, 4, 5, 6] },
                { label: "Language", id: "language", options: ["English"] },
                {
                  label: "Draw Time",
                  id: "drawTime",
                  options: [20, 30, 40, 50, 60],
                },
                { label: "Rounds", id: "rounds", options: [2, 3, 4, 5, 6] },
                {
                  label: "Game Mode",
                  id: "gameMode",
                  options: ["Normal", "Hidden", "Combination"],
                },
                {
                  label: "Word Count",
                  id: "wordCount",
                  options: [1, 2, 3, 4, 5],
                },
                { label: "Hint", id: "hint", options: [0, 1, 2] },
              ].map((item) => (
                <div key={item.id} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1">
                    {item.label}
                  </label>
                  <select
                    onChange={handleChange}
                    value={settings[item.id]}
                    id={item.id}
                    disabled={!isHost}
                    className={`px-3 py-2 border rounded-lg 

      ${!isHost ? "bg-gray-100 cursor-not-allowed" : "focus:ring-2 focus:ring-blue-500"}`}
                  >
                    {item.options.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}

              <div className="mt-2 text-center">
                <p className="text-gray-500 text-sm">Room Code</p>
                <p className="text-lg font-semibold tracking-widest">{room}</p>
              </div>

              <button
                disabled={!(isHost && players.length >= 2)}
                onClick={handleSubmit}
                className={`mt-4 py-2 rounded-lg text-white
                  ${(isHost && players.length >= 2) ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"}`}
              >
                Start Game
              </button>
            </div>
          </>
        )}

        {screen === "Game" && 
         <Canvas
         socket={socket}
         roomCode={room}
         roomSetting={settings}
         />
       }

      </div>

      {/* RIGHT → Chat */}
      <div className="w-1/4 bg-white rounded-2xl shadow p-4 flex flex-col">
        <h2 className="text-xl font-semibold mb-3">Chat</h2>
        <Chat socket={socket} username={username} roomCode={room} />
      </div>
    </div>
  );
}
