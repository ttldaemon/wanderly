import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { hash } from "bcryptjs";
import { IUser, User } from "@/models/user";
import { connectDB } from "@/lib/db";

const registerSchema = z.object({
  name: z.string(),
  userName: z.string(),
  email: z.email(),
  imgUrl: z.string().optional(),
  password: z
    .string()
    .min(6, { message: "Password must be of minimum 6 characters" })
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsedBody = registerSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          success: false,
          msg: parsedBody.error,
        },
        { status: 400 },
      );
    }

    const { name, userName, email, imgUrl, password } = parsedBody.data;

    await connectDB();

    const userExist = await User.findOne({ userName });

    if (userExist) {
      return NextResponse.json(
        {
          success: false,
          msg: "User with this username already exists",
        },
        { status: 400 },
      );
    }

    const hashedPass = await hash(password, 12);

    const user: IUser = await User.create({
      name,
      userName,
      email,
      imgUrl,
      password: hashedPass
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          msg: "Failed to register the user",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        msg: "Registration successfull",
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        msg: "Something went wrong while registering",
      },
      { status: 500 },
    );
  }
}
