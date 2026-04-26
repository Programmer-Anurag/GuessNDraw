import { createContext, useContext, useState } from "react";

const GameContext = createContext();

export function GameProvider({ children }) {
  const [players, setPlayers] = useState([]);
  const [room, setRoom] = useState("");
  const [screen, setScreen] = useState("Home");

  return (
    <GameContext.Provider
      value={{
        players,
        setPlayers,
        room,
        setRoom,
        screen,
        setScreen,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

// custom hook (clean usage)
// eslint-disable-next-line react-refresh/only-export-components
export function useGame() {
  return useContext(GameContext);
}