"use client";
import React, { useEffect, useRef, useState } from "react";
import Player from "./Player";
import Ball from "./Ball";

/** ——                    —— */
/** —— TIPI IN KONSTANTE—— */
/** ——                —— */

type XY = { x: number; y: number }; // tip za 2D točko/vektor
// Uporablja se za pozicije (igralci, žoga), kurzor, kontrolne točke bezier krivulje itd.
/** —— ZACETNE POZICIJE —— */
const initialPlayers = [
  { id: 1, x: 225, y: 270, team: "home" as const },
  { id: 2, x: 60, y: 200, team: "home" as const },
  { id: 3, x: 400, y: 200, team: "home" as const },
  { id: 4, x: 0, y: 20, team: "home" as const },
  { id: 5, x: 450, y: 20, team: "home" as const },
  { id: 6, x: 225, y: 220, team: "away" as const },
  { id: 7, x: 100, y: 170, team: "away" as const },
  { id: 8, x: 350, y: 170, team: "away" as const },
  { id: 9, x: 150, y: 30, team: "away" as const },
  { id: 10, x: 310, y: 30, team: "away" as const },
];
const initialBall: XY = { x: 250, y: 260 };

/** —— BASKETBALL —— */
const BALL_ON_PLAYER_OFFSET = 8; // snap žoge na (player.x+8, player.y+8) KAM NA IGRALCA SE DA ZOGA """zaj je na sredino"
const BALL_PASS_CURVE = 15; // curve podaje

/** —— trail nastavitve —— */
const PLAYER_SIZE = 40;
const PLAYER_CENTER = PLAYER_SIZE / 2; //sredina igravca , kamse zalepi zoga
const TRAIL_MAX_POINTS = 24;
const TRAIL_SAMPLE_PX = 18;
const TRAIL_FADE_MS = 20;
const TRAIL_STROKE_WIDTH = 4;
const TRAIL_DASH = "8 8";

/** —— BLOK (rdeča stena) —— */
const WALL_LEN = 42;
const WALL_THICK = 7;
const WALL_LIFETIME_MS = 2500;
const BLOCK_COLOR_SOFT = "rgba(194, 118, 118, 1)";
const BLOCK_COLOR_LOCKED = "rgba(236, 76, 76, 1)";
const BLOCK_OFFSET = 2;// 2px razmika med crto in igralcem
const DUBLE_CLICK_MS = 600;


/** ——                  —— */
/** —— MAIN KOMPONENTA—— */
/** ——             —— */

export default function Court() {
  const [players, setPlayers] = useState(initialPlayers); // stanje igralcev (id, x, y, team)
  const [ball, setBall] = useState<XY>(initialBall); // stanje žoge (x, y)
  const [passArmed, setPassArmed] = useState(false); // ali je zoga klikjena da jo je mozno podat
  const [ballHolder, setBallHolder] = useState<number | null>(null); // id igralca ki drzi zogo 
  const wrapperRef = useRef<HTMLDivElement>(null); // ref na div ki drzi celoten court(za merjenje kordinate miško)
  const [cursor, setCursor] = useState<XY | null>(null); // pozicija miske (x, y) ali null če ni na igrišču
  const rafId = useRef<number | null>(null); // requestAnimationFrame id (za preklic)
  const animStart = useRef<number>(0); // čas začetka animacije podaje
  const animFrom = useRef<XY>({ x: 0, y: 0 }); // iz kje podajamo
  const animTo = useRef<XY>({ x: 0, y: 0 }); // kam podajamo
  const ctrl = useRef<XY>({ x: 0, y: 0 }); // kontrolna točka Bezier za krivuljo podaje
  const [isPassAnimating, setIsPassAnimating] = useState(false); // ali je podaja v teku
  const animDurationMs = 420; // trajanje animacije podaje v ms  -- 0.42s lowkey lahk fix ker ne dalse se hitreje poda ko na krajse razdalje
  const [ballRotation, setBallRotation] = useState(0); // rotacija žoge v stopinjah
  const startRot = useRef(0); // začetna rotacija žoge pri podaji
  const spinDeg = useRef(720); // koliko stopinj se žoga obrne med podajo
  const [ballScale, setBallScale] = useState(1); //  pop efekt ob pristanku podaje
  const popTimer = useRef<number | null>(null); // timer za pop efekt 

  // ——— BLOK ———
  const [blockAim, setBlockAim] = useState<{  //na kerem igralciu je miška in pod kakšnim kotom za izris bloka
    playerId: number;
    angle: number;
  } | null>(null);  
 

  const [lockedBlocks, setLockedBlocks] = useState<  // blok se sprozi (array objektov s key, playerId in angle
    Array<{ key: number; playerId: number; angle: number }>
  >([]);
  const [pendingBlock, setPendingBlock] = useState<{ // za duble klik detekcijo
    id: number;
    time: number;
  } | null>(null);

  // ——— TRAIL ———
  const [trails, setTrails] = useState<Record<number, XY[]>>({}); // id igralca -> array točk (x,y) za trail
  const lastTrailPointRef = useRef<Record<number, XY>>({}); // Zadnja zapisana točka (za vzorčenje na TRAIL_SAMPLE_PX).
  const currCenterRef = useRef<Record<number, XY>>({}); //Trenutni center igralca med dragom (računamo sproti z dx,dy).
  const fadeTimers = useRef<Record<number, number>>({}); // da skine trail ko igralec preneha z dragom

  //  ——— od tu dalje readme ———
  const dist = (a: XY, b: XY) => Math.hypot(a.x - b.x, a.y - b.y);
  const clearFadeTimer = (id: number) => {
    if (fadeTimers.current[id]) {
      clearInterval(fadeTimers.current[id]);
      delete fadeTimers.current[id];
    }
  };
  const pushTrailPoint = (id: number, pt: XY) => {
    setTrails((prev) => {
      const arr = prev[id] || [];
      const next = [...arr, pt].slice(-TRAIL_MAX_POINTS);
      return { ...prev, [id]: next };
    });
    lastTrailPointRef.current[id] = pt;
  };
  const fadeOutTrail = (id: number) => {
    clearFadeTimer(id);
    fadeTimers.current[id] = window.setInterval(() => {
      setTrails((prev) => {
        const arr = prev[id] || [];
        if (arr.length <= 2) {
          clearFadeTimer(id);
          const { [id]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [id]: arr.slice(1) };
      });
    }, TRAIL_FADE_MS);
  };

  /** ---------- podaja ---------- */
  const onPlayerClickForPass = (id: number) => {
    if (!passArmed) return;
    const target = players.find((p) => p.id === id);
    if (!target) return;

    // žoga gre v "zrak" → ni več pri igralcu
    setBallHolder(null);

    animFrom.current = { ...ball };
    animTo.current = {
      x: target.x + BALL_ON_PLAYER_OFFSET,
      y: target.y + BALL_ON_PLAYER_OFFSET,
    };
    ctrl.current = bezierControl(
      animFrom.current,
      animTo.current,
      BALL_PASS_CURVE
    );

    startRot.current = ballRotation;
    animStart.current = performance.now();
    setPassArmed(false);
    setIsPassAnimating(true);
    cancelRAF();
    rafId.current = requestAnimationFrame(tickPass(id));
  };

  const tickPass =
    (targetId: number) =>
    (now: number): void => {
      const p = Math.min(1, (now - animStart.current) / animDurationMs);
      const eased = easeInOutQuad(p);
      const pos = quadBezier(
        animFrom.current,
        ctrl.current,
        animTo.current,
        eased
      );
      setBall(pos);
      setBallRotation(startRot.current + spinDeg.current * eased);

      if (p < 1) {
        rafId.current = requestAnimationFrame(tickPass(targetId));
      } else {
        cancelRAF();
        // snap na trenutni targetov položaj + offset (če se je med animacijo premaknil)
        setBall((prev) => {
          const t = players.find((pl) => pl.id === targetId);
          if (!t) return { ...animTo.current };
          return {
            x: t.x + BALL_ON_PLAYER_OFFSET,
            y: t.y + BALL_ON_PLAYER_OFFSET,
          };
        });
        setIsPassAnimating(false);
        setBallScale(1.14);
        setBallHolder(targetId); // žoga je zdaj pri igralcu
        if (popTimer.current) window.clearTimeout(popTimer.current);
        popTimer.current = window.setTimeout(() => setBallScale(1), 140);
      }
    };

  const cancelRAF = () => {
    if (rafId.current != null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cancelRAF();
      if (popTimer.current) window.clearTimeout(popTimer.current);
      Object.keys(fadeTimers.current).forEach((k) => clearFadeTimer(Number(k)));
    };
  }, []);

  // ——— miška -> vodilna črta + kot za steno ———
  const angleTo = (from: XY, to: XY) =>
    Math.atan2(to.y - from.y, to.x - from.x);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wrapperRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cur = { x: e.clientX - r.left, y: e.clientY - r.top };
    setCursor(cur);

    if (blockAim) {
      const p = players.find((pl) => pl.id === blockAim.playerId);
      if (p) {
        const center = { x: p.x + PLAYER_CENTER, y: p.y + PLAYER_CENTER };
        setBlockAim({
          playerId: blockAim.playerId,
          angle: angleTo(center, cur),
        });
      }
    }
  };
  const onMouseLeave = () => setCursor(null);

  // ——— klik NA PRAZNO igrišče -> zakleni steno ———
  const onEmptyCourtClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (blockAim) {
      lockBlock(blockAim.playerId, blockAim.angle);
      setBlockAim(null);
    }
    setPassArmed(false);
  };

  // ——— zaklepanje bloka ———
  const lockBlock = (playerId: number, angle: number) => {
    const key = Date.now() + playerId;
    setLockedBlocks((prev) => [...prev, { key, playerId, angle }]);
    window.setTimeout(() => {
      setLockedBlocks((prev) => prev.filter((b) => b.key !== key));
    }, WALL_LIFETIME_MS);
  };

  // ——— klik na igralca (double-click ≤ DUBLE_CLICK_MS vklopi aim) ———
  const onPlayerBlockClick = (id: number) => {
    const timeNow = Date.now();

    if (blockAim?.playerId === id) {
      // drugi klik na istega igralca -> prekliči aim (NE zakleni)
      setBlockAim(null);
      setPendingBlock(null);
      return;
    }

    if (
      pendingBlock &&
      pendingBlock.id === id &&
      timeNow - pendingBlock.time <= DUBLE_CLICK_MS
    ) {
      // drugi zaporedni klik hitro -> vklopi aim
      setBlockAim({ playerId: id, angle: 0 });
      setPendingBlock(null);
    } else {
      // shrani kot prvi klik
      setPendingBlock({ id, time: timeNow });
    }
  };

  // ——— risanje stene (tangentno ob krogu igralca) ———
  const renderWallForPlayer = (
    playerId: number,
    angle: number,
    color: string,
    soft = false
  ) => {
    const p = players.find((pl) => pl.id === playerId);
    if (!p) return null;
    const cx = p.x + PLAYER_CENTER;
    const cy = p.y + PLAYER_CENTER;

    const radial = { x: Math.cos(angle), y: Math.sin(angle) };
    const tangentAngle = angle + Math.PI / 2;
    const px = cx + radial.x * (PLAYER_CENTER + WALL_THICK / 2 + BLOCK_OFFSET);
    const py = cy + radial.y * (PLAYER_CENTER + WALL_THICK / 2 + BLOCK_OFFSET);
    const deg = (tangentAngle * 180) / Math.PI;
    const opacity = soft ? 0.35 : 1;

    return (
      <g transform={`translate(${px},${py}) rotate(${deg})`}>
        <rect
          x={-WALL_LEN / 2}
          y={-WALL_THICK / 2}
          width={WALL_LEN}
          height={WALL_THICK}
          rx={WALL_THICK / 2}
          fill={color}
          opacity={opacity}
          filter={soft ? "url(#trail-blur)" : undefined}
        />
      </g>
    );
  };

  // barva traila
  const baseColorFor = (id: number) => {
    const team = players.find((p) => p.id === id)?.team;
    return team === "home" ? [59, 130, 246] : [0, 128, 0]; // blue-500 / lime-500
  };

  return (
    <div
      ref={wrapperRef}
      className="relative w-[500px] h-[800px] bg-[url('/img/court.png')] bg-cover bg-center border-4 border-gray-800 mx-auto mt-10 select-none"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onEmptyCourtClick}
    >
      {/* SVG sloj: TRAIL + vodilne/podajne črte + BLOK */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width="100%"
        height="100%"
      >
        {/* mehka (aim) stena */}
        {blockAim &&
          renderWallForPlayer(
            blockAim.playerId,
            blockAim.angle,
            BLOCK_COLOR_SOFT,
            true
          )}

        {/* zaklenjene stene */}
        {lockedBlocks.map((b) => (
          <g key={b.key}>
            {renderWallForPlayer(b.playerId, b.angle, BLOCK_COLOR_LOCKED)}
          </g>
        ))}

        {/* TRAILI */}
        {Object.entries(trails).map(([idStr, pts]) => {
          const id = Number(idStr);
          if (!pts || pts.length < 2) return null;
          const [r, g, b] = baseColorFor(id);
          const n = pts.length - 1;
          return (
            <g
              key={id}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#trail-blur)"
            >
              {pts.slice(1).map((pt, i) => {
                const prev = pts[i];
                const t = (i + 1) / (n + 1);
                const width = TRAIL_STROKE_WIDTH * (0.6 + 0.6 * t);
                const alpha = 0.15 + 0.6 * t;
                return (
                  <line
                    key={i}
                    x1={prev.x}
                    y1={prev.y}
                    x2={pt.x}
                    y2={pt.y}
                    stroke={`rgba(${r},${g},${b},${alpha})`}
                    strokeWidth={width}
                    strokeDasharray={TRAIL_DASH}
                  />
                );
              })}
            </g>
          );
        })}

        <defs>
          <filter id="trail-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
          </filter>
        </defs>

        {/* vodilna črta: ball -> cursor */}
        {passArmed && cursor && (
          <line
            x1={ball.x}
            y1={ball.y}
            x2={cursor.x}
            y2={cursor.y}
            stroke="grey"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="8 8"
          />
        )}

        {/* črta poti podaje med animacijo */}
        {isPassAnimating && (
          <line
            x1={animFrom.current.x}
            y1={animFrom.current.y}
            x2={animTo.current.x}
            y2={animTo.current.y}
            stroke="lime"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="8 8"
          />
        )}
      </svg>

      {/* igralci */}
      {players.map((player) => {
        const id = player.id;

        const handleDragStart = () => {
          clearFadeTimer(id);
          const start = {
            x: player.x + PLAYER_CENTER,
            y: player.y + PLAYER_CENTER,
          };
          currCenterRef.current[id] = start;
          lastTrailPointRef.current[id] = start;
          setTrails((prev) => ({ ...prev, [id]: [start] }));
        };

        const handleDrag = (dx: number, dy: number) => {
          // premakni igralca
          setPlayers((prev) =>
            prev.map((p) =>
              p.id === id ? { ...p, x: p.x + dx, y: p.y + dy } : p
            )
          );

          // če je žoga pri tem igralcu in ne leti v podaji, premakni tudi žogo
          if (ballHolder === id && !isPassAnimating) {
            setBall((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
          }

          // trail
          const curr = currCenterRef.current[id] || {
            x: player.x + PLAYER_CENTER,
            y: player.y + PLAYER_CENTER,
          };
          const next = { x: curr.x + dx, y: curr.y + dy };
          currCenterRef.current[id] = next;

          const last = lastTrailPointRef.current[id];
          if (!last || dist(next, last) >= TRAIL_SAMPLE_PX) {
            setTrails((prev) => {
              const arr = prev[id] || [];
              const newArr = [...arr, next].slice(-TRAIL_MAX_POINTS);
              return { ...prev, [id]: newArr };
            });
            lastTrailPointRef.current[id] = next;
          }
        };

        const handleDragEnd = () => {
          fadeOutTrail(id);
        };

        return (
          <Player
            key={id}
            id={id}
            x={player.x}
            y={player.y}
            team={player.team}
            onClick={() => {
              if (passArmed) onPlayerClickForPass(id);
              else onPlayerBlockClick(id); // double-click za aim
            }}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
          />
        );
      })}

      {/* žoga */}
      <Ball
        x={ball.x}
        y={ball.y}
        rotation={ballRotation}
        scale={ballScale}
        selected={passArmed}
        onClick={() => setPassArmed((s) => !s)}
      />
    </div>
  );
}

/* ---------- math utils ---------- */
function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
function quadBezier(p0: XY, p1: XY, p2: XY, t: number): XY {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}
function bezierControl(from: XY, to: XY, height = 60): XY {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  return { x: mx + nx * height, y: my + ny * height };
}
