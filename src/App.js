import React from "react";
import Matchmaking from "./components/Matchmaking";

function App() {
  const handleMatchFound = (gameId, you, opponent) => {
    console.log("Eşleşme tamam 🎉");
    console.log("Oyun ID:", gameId);
    console.log("Sen:", you, "| Rakip:", opponent);
    // Buradan sonra oyun ekranına geçiş yapabilirsin
  };

  return <Matchmaking onMatchFound={handleMatchFound} />;
}

export default App;  
