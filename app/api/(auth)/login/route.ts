import { connectDB } from "@/lib/db";
import { User } from "@/models/user";
import { generateToken } from "@/utils/helpers";
import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const loginSchema = z.object({
  userName: z.string(),
  password: z.string().min(6, "Password is not valid")
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsedBody = loginSchema.safeParse(body)

    if (!parsedBody.success) {
      return NextResponse.json({success: false, msg: parsedBody.error}, { status: 400 })
    }

    const { userName, password } = parsedBody.data

    await connectDB()

    const user = await User.findOne({ userName })

    if (!user) {
      return NextResponse.json({success: false, msg: "User not found"}, { status: 404 })
    }

    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({success: false, msg: "Invalid password"}, { status: 401 })
    }

    const token = generateToken(user);

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
    })

    return NextResponse.json({success: true, msg: "Login successful"}, { status: 200 })
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({success: false, msg: "Internal server error"}, { status: 500 })
  }
}