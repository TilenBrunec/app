import mongoose from "mongoose";

const uri = process.env.MONGODB_URI!;

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) return;

  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log("✅ Povezan na MongoDB");
  } catch (error) {
    console.error("❌ Napaka pri povezovanju na MongoDB:", error);
    throw error;
  }
}