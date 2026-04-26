import Home from "./components/Home";
import Room from "./components/Room";
import { GameProvider, useGame } from "./context/GameContext";

function AppContent() {
  const { screen } = useGame();

  return (
    <>
      {screen === "Home" && <Home />}
      {(screen === "Room" || screen === "Game")  && <Room />}
      
    </>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;