import { connectDB } from "@/lib/db";
import { Tour } from "@/models/tour";
import { User } from "@/models/user";
import { verifyToken } from "@/utils/helpers";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export async function GET() {
  let decoded;
  try {
    await connectDB();
    const decoded = await verifyToken();

    if (!decoded) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new Types.ObjectId(decoded._id); // need to convert it into object Id because in the 22 no line we are using aggregate which is a mongodb operator not mongoose, and it requires objectId not just the string of Id

    console.log(userId);

    // recommended users
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
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $project: {
          _id: 1,
          userId: 1,
          imgUrls: 1,
          caption: 1,
          location: 1,
          tags: 1,
          createdAt: 1,
          author: {
            _id: "$author._id",
            name: "$author.name",
            userName: "$author.userName",
            imgUrl: "$author.imgUrl",
          },
        },
      },
    ]);

    console.log(users);
    console.log(tours);

    return NextResponse.json(
      {
        success: true,
        msg: "Initial data fetched successfully",
        users,
        tours,
      },
      { status: 200 },
    );
  } catch (error: unknowm) {
    console.error(error);
    return NextResponse.json(
      { msg: "Internal Server Error", error: error.message },
      { status: 500 },
    );
  }
}
