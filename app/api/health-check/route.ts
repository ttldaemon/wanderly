import { connectDB } from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET() {
  await connectDB();

  return NextResponse.json({
    success: true,
    msg: "Server is up"
  }, {status: 200})
}