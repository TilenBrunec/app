"use client";
import { motion } from "framer-motion";

type PlayerProps = {
  id: number;
  x: number;
  y: number;
  team: "home" | "away";
  onDrag?: (dx: number, dy: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onClick?: () => void;
};

export default function Player({
  id, x, y, team, onDrag, onDragStart, onDragEnd, onClick,
}: PlayerProps) {
  return (
    <motion.div
      className={`absolute w-10 h-10 rounded-full flex items-center justify-center text-white font-bold cursor-pointer shadow-lg border-2 ${
        team === "home"
          ? "bg-gradient-to-br from-slate-700 to-slate-900 border-slate-500 hover:from-slate-600 hover:to-slate-800"
          : "bg-gradient-to-br from-lime-700 to-lime-900 border-lime-500 hover:from-lime-600 hover:to-lime-800"
      }`}
      style={{ x, y }}
      drag={!!onDrag}
      dragMomentum={false}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      onDragStart={(e, _info) => { onDragStart?.(); }}
      onDrag={(e, info) => { onDrag?.(info.delta.x, info.delta.y); }}
      onDragEnd={(e, _info) => { onDragEnd?.(); }}
      title={`Igralec ${id}`}
    >
      {id}
    </motion.div>
  );
}
