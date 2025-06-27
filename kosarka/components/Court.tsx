"use client";
import { useState } from "react";
import Player from "./Player";
import Ball from "./Ball";

const initialPlayers = [
  { id: 1, x: 225, y: 270, team: "home" },
  { id: 2, x: 60, y: 200, team: "home" },
  { id: 3, x: 400, y: 200, team: "home" },
  { id: 4, x: 70, y: 20, team: "home" },
  { id: 5, x:390, y: 20, team: "home" },
  { id: 6, x: 225, y: 220, team: "away" },
  { id: 7, x: 100, y: 170, team: "away" },
  { id: 8, x: 350, y: 170, team: "away" },
  { id: 9, x: 150, y: 30,team: "away" },
  { id: 10, x:300, y: 30, team: "away" },
];
const initalBall = { x: 250, y: 260 };

export default function Court() {
  const [players, setPlayers] = useState(initialPlayers);
  const [ball, setBall] = useState(initalBall);

  return (
    <div className="relative w-[500px] h-[800px] bg-[url('/img/court.png')]  bg-cover bg-center border-4 border-gray-800 mx-auto mt-10">
      {players.map((player) => (
        <Player
          key={player.id}
          id={player.id}
          x={player.x}
          y={player.y}
          team={player.team as "home" | "away"}
          onDrag={(dx, dy) => {
            setPlayers((prev) =>
              prev.map((p) =>
                p.id === player.id ? { ...p, x: p.x + dx, y: p.y + dy } : p
              )
            );
          }}
        />
      ))}
      <Ball
        x={ball.x}
        y={ball.y}
        onDrag={(dx, dy) => {
          setBall((prev) => ({
            x: prev.x + dx,
            y: prev.y + dy,
          }));
        }}
      />
    </div>
  );
}
