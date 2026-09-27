import { connectDB } from "@/lib/db";
import { Tour } from "@/models/tour";
import { User } from "@/models/user";
import { verifyToken } from "@/utils/helpers";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    let decoded;
    try {
      decoded = await verifyToken();
    } catch {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = new Types.ObjectId(decoded._id);

    const currentUser = await User.findById(userId)
      .select("_id name userName imgUrl")
      .lean();

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 7 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          userName: 1,
          imgUrl: 1,
        },
      },
    ]);

    const tours = await Tour.aggregate([
      {
        $match: {
          userId: { $ne: userId },
          visibility: "public",
        },
      },
      {
        $sample: { size: 20 },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          imgUrls: 1,
          caption: 1,
          location: 1,
          tags: 1,
          createdAt: 1,
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        msg: "Initial data fetched successfully",
        currentUser,
        users,
        tours,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { message: "Internal Server Error", error: message },
      { status: 500 },
    );
  }
}