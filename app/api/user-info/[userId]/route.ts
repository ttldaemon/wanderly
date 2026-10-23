import { connectDB } from "@/lib/db";
import { Tour } from "@/models/tour";
import { User } from "@/models/user";
import { verifyToken } from "@/utils/helpers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    await connectDB();

    const { userId } = await params;

    const user = await User.findById(userId)
      .select("_id name userName imgUrl")
      .lean(); // lean is used because we only want to return the values, we dont have to modify it, so using it decreases the memory overhead
    user.totalTours = await Tour.countDocuments({ userId });

    if (!user) {
      throw new Error("User fetching failed!!!"); // user fetching from mongodb failed
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";

    return NextResponse.json(
      { message: "Internal Server Error", error: message },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const body = await req.json();
    await connectDB();
    await verifyToken()
    const { userId } = await params;


    const updatedUser = await User.findByIdAndUpdate(userId, body, {
      returnDocument: "after",
    })
      .select("_id name userName imgUrl")
      .lean();

    // console.log(updatedUser)

    if (!updatedUser) {
      throw new Error("User updation failed!!!");
    }
    
    return NextResponse.json(
      { success: true, user: updatedUser },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json(
      { message: "Internal Server Error", error: message },
      { status: 500 },
    );
  }
}


export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    await connectDB();
    await verifyToken();

    const { userId } = await params;

    // console.log("Requested userId:", userId);

    const deletedUser = await User.findByIdAndDelete(userId);

    // console.log("Deleted user:", deletedUser);

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "User deleted successfully" },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";

    return NextResponse.json(
      { success: false, msg: message },
      { status: 500 },
    );
  }
}