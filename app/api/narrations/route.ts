import { NextResponse } from "next/server";
import { listNarrationFiles } from "@/app/lib/appwrite";

export async function GET() {
  const narrations = await listNarrationFiles(12);
  return NextResponse.json({ narrations });
}
