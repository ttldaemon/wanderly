import { connectDB } from "@/lib/db";
import { User } from "@/models/user";
import { verifyToken } from "@/utils/helpers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB()
    const decoded = await verifyToken()

    if (!decoded) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(decoded._id).select("_id name userName imgUrl").lean() // lean is used because we only want to return the values, we dont have to modify it, so using it decreases the memory overhead

    if (!user) {
      throw new Error("User fetching failed!!!") // user fetching from mongodb failed
    }

    return NextResponse.json({success: true, user}, {status: 200})
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Something went wrong"
    
    return NextResponse.json(
      { message: "Internal Server Error", error: message },
      { status: 500 },
    );
  }
}