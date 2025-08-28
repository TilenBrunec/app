# 🏀 Basketball Play Designer

Interactive basketball court built with **Next.js**, **React**, **Framer Motion**, and **Tailwind CSS**.  
It allows coaches or players to **draw plays**, **simulate passes**, **move players with trails**, and **add screens (“blocks”)**.

---

## ✨ Features

- **Passing**: click ball → click player → ball animates to target with spin & bounce.
- **Ball possession**: when a player has the ball, dragging them moves the ball too.
- **Player movement**: drag players around; dashed trails fade out behind them.
- **Blocks (screens)**:
  - Double-click a player → show **soft red wall** (aim, rotates with mouse).
  - Click empty court → lock as **dark red wall** (lasts a few seconds).
  - Click same player again while aiming → cancel block (no lock).

---

## 🎮 How to Use

### Passing
1. **Click the ball** → it highlights (armed for pass).
2. **Click a player** → ball passes to them along a curve.
3. When pass finishes, the ball **sticks to the player**.
4. **Click empty court** → cancels armed pass.

### Moving Players
- **Drag any player circle** to move them.
- A **dashed trail** follows their movement and fades out.
- If the player **has the ball**, the ball follows during drag.

### Setting a Block
- **Double-click** a player (within ~600 ms) → soft red wall (aim).
- Wall rotates toward your mouse direction.
- **Click empty court** → lock the wall (dark red), stays ~2.5s.
- **Click same player again** while aiming → cancel aim (no lock).

---


## 🗂️ Project Structure
```ts
app/
  layout.tsx       # Root layout with fonts and globals
  globals.css      # Tailwind + theme variables
  page.tsx         # Entry point rendering <Court />

components/
  Court.tsx        # Core logic: passes, blocks, trails, ball handling
  Player.tsx       # Draggable player circle (Framer Motion)
  Ball.tsx         # Ball element with spin, highlight, and draggable support

```
## 🛠️ Tech Stack
Next.js (App Router)

React

Framer Motion (drag, animation)

Tailwind CSS

TypeScript

🚀 Getting Started
```bash
# install deps
npm install   # or: pnpm install / yarn install

# run dev
npm run dev   # or: pnpm dev / yarn dev

# open in browser
http://localhost:3000
Requires images in /public/img/court.png and /public/img/basketball.png.
```

📌 Notes
Clicking empty court always cancels a pass and locks/cancels aim if active.

During pass animation, if the target player moves, ball snaps to their new position.

Trails are visual only; they don’t block or affect physics.

