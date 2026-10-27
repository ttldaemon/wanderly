
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  console.log("logging out")
  cookieStore.delete("token")
 
  return NextResponse.json({
       success: true,
       msg: "User logged out successfully",
     },
     { status: 200 })
}
