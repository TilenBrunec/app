import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb"; // tvoj mongodb.ts
import mongoose from "mongoose";

// Definiraj schema (če še nimaš modela)
const actionSchema = new mongoose.Schema(
  {
    name: String,
    createdAt: String,
    initialPlayers: Array,
    paths: Array,
    events: Array,
    durationMs: Number,
  },
  { collection: "actions" }
);

const Action = mongoose.models.Action || mongoose.model("Action", actionSchema);

// GET -> pridobi vse akcije
export async function GET() {
  await connectToDatabase();
  const actions = await Action.find().sort({ createdAt: -1 });
  return NextResponse.json(actions);
}

// POST -> shrani novo akcijo
export async function POST(req: Request) {
  await connectToDatabase();
  const body = await req.json();
  const action = await Action.create(body);
  return NextResponse.json(action);
}
