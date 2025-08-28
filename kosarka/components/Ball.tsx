"use client";
import { motion } from "framer-motion";

type BallProps = {
  x: number;
  y: number;
  rotation?: number;
  scale?: number;
  onDrag?: (dx: number, dy: number) => void;
  onClick?: () => void;
  selected?: boolean;
};

export default function Ball({
  x,
  y,
  rotation = 0,
  scale = 1,
  onDrag,
  onClick,
  selected,
}: BallProps) {
  return (
    <motion.div
      className="absolute w-6 h-6 rounded-full border border-black bg-[url('/img/basketball.png')] bg-cover bg-center cursor-pointer"
      style={{
        x,
        y,
        rotate: rotation,
        scale,
        boxShadow: selected ? "0 0 0 6px rgba(255,165,0,.35)" : undefined,
      }}
      drag={!!onDrag}
      dragMomentum={false}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onDrag={(e, info) => {
        if (onDrag) onDrag(info.delta.x, info.delta.y);
      }}
      title={selected ? "Klikni igralca za podajo" : "Žoga"}
    />
  );
}
