"use client";
import { motion } from "framer-motion";

type PlayerProps = {
  id: number;
  x: number;
  y: number;
  team: "home" | "away";
  onDrag?: (dx: number, dy: number) => void;
};

export default function Player({ id, x, y, team, onDrag }: PlayerProps) {
  return (
    <motion.div
      className={`absolute w-10 h-9.5 rounded-full flex items-center justify-center text-white font-bold cursor-pointer shadow-lg border-2 ${
        team === "home" 
          ? "bg-gradient-to-br from-slate-700 to-slate-900 border-slate-500 hover:from-slate-600 hover:to-slate-800" 
          : "bg-gradient-to-br from-amber-700 to-amber-900 border-amber-500 hover:from-amber-600 hover:to-amber-800"
      }`}
      style={{ x, y }}
      drag={!!onDrag}
      dragMomentum={false}
      onDrag={(e, info) => {
        if (onDrag) onDrag(info.delta.x, info.delta.y);
      }}
    >
      {id}
    </motion.div>
  );
}