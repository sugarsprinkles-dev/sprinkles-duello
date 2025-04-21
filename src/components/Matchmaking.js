import React, { useState, useEffect } from "react";
import { getDatabase, ref, push, onValue, remove, set } from "firebase/database";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../firebaseConfig";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function Matchmaking({ onMatchFound }) {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("İsmini gir ve Oyuna Başla!");
  const [playerId, setPlayerId] = useState(null);

  const handleStart = async () => {
    if (!username) return alert("Lütfen bir isim gir.");
    setStatus("Eşleşme aranıyor...");

    const waitingRef = ref(db, "waitingPlayers");

    onValue(
      waitingRef,
      async (snapshot) => {
        const players = snapshot.val();
        if (players) {
          const entries = Object.entries(players);
          for (let [id, player] of entries) {
            if (player.username !== username) {
              const gameId = Date.now().toString();

              await set(ref(db, `games/${gameId}`), {
                player1: { id, username: player.username },
                player2: { id: "local", username },
                createdAt: Date.now(),
              });

              await remove(ref(db, `waitingPlayers/${id}`));

              setStatus(`Rakip bulundu: ${player.username}`);
              onMatchFound(gameId, username, player.username);
              return;
            }
          }
        }

        const newRef = push(waitingRef);
        await set(newRef, {
          username,
          timestamp: Date.now(),
        });
        setPlayerId(newRef.key);
      },
      { onlyOnce: true }
    );
  };

  useEffect(() => {
    const cleanup = () => {
      if (playerId) {
        remove(ref(db, `waitingPlayers/${playerId}`));
      }
    };
    window.addEventListener("beforeunload", cleanup);
    return () => window.removeEventListener("beforeunload", cleanup);
  }, [playerId]);

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h1>Sprinkles'in Kart Düellosuna Hoş Geldiniz!</h1>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="İsminizi girin"
        style={{ padding: 10, fontSize: 16, marginBottom: 10 }}
      />
      <br />
      <button
        onClick={handleStart}
        style={{ padding: "10px 20px", fontSize: 16 }}
      >
        Oyuna Başla
      </button>
      <p>{status}</p>
    </div>
  );
}

export default Matchmaking;