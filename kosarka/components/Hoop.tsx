"use client";

import React from "react";

type HoopProps = {
  
  x: number;
  y: number;
  /** Klikabilni hitbox (širina/višina v px) */
  hitW?: number;
  hitH?: number;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;

  debug?: boolean;
  title?: string;
};

export default function Hoop({
  x,
  y,
  hitW = 44,
  hitH = 24,
  onClick,
  debug = false,
  title = "Hoop target",
}: HoopProps) {
  return (
    <div
      className={`absolute ${debug ? "bg-red-500/30 outline outline-1 outline-red-500" : ""}`}
      style={{
        left: x - hitW / 2,
        top: y - hitH / 2,
        width: hitW,
        height: hitH,
        pointerEvents: "auto",
        opacity: debug ? 1 : 0, // neviden če ni debug
      }}
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    />
  );
}
