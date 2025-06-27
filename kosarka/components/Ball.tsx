"use client";
import { motion } from "framer-motion";

type BallProps = {
  x: number;
  y: number;
  onDrag?: (dx: number, dy: number) => void;
};

export default function Ball({ x, y, onDrag }: BallProps) {
  return (
    <motion.div
      className="absolute w-6 h-6 rounded-full border border-black 
                 bg-[url('/img/basketball.png')] bg-cover bg-center cursor-pointer"
      style={{ x, y }}
      drag={!!onDrag}
      dragMomentum={false}
      onDrag={(e, info) => {
        if (onDrag) onDrag(info.delta.x, info.delta.y);
      }}
    />
  );
}
