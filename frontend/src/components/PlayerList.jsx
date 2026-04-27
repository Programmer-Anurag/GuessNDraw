import { useGame } from "../context/GameContext";
import { useEffect } from "react";


export default function PlayerList({socket}) {
    const {players,setPlayers}=useGame();

    useEffect(() => {

    socket.on("correct_guess", ({ playerId, players }) => {
        console.log("Correct guess by:", playerId);
        // update players list (score updated)
        setPlayers(players);
    });

    return () => socket.off("correct_guess");

}, []);
  return (
    <div className="flex flex-col gap-2">
      {players.length === 0 ? (
        <p className="text-gray-500 text-sm">No players yet</p>
      ) : (
        players.map((player) => (
          <div
            key={player.Id}
            className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg shadow-sm"
          >
            {/* Left side */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                {player.name[0].toUpperCase()}
              </div>

              <div>
                <p className="font-medium text-gray-800">
                  {player.name}
                  {player.isHost && (
                    <span className="ml-2 text-xs text-green-500">
                      (Host)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Right side */}
            <p className="text-sm font-semibold text-gray-600">
              {player.score} pts
            </p>
          </div>
        ))
      )}
    </div>
  );
}