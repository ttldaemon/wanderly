import { connectDB } from "@/lib/db";
import { Tour } from "@/models/tour";
import { User } from "@/models/user";
import { verifyToken } from "@/utils/helpers";
import { NextRequest, NextResponse } from "next/server";

type UserResult = {
  _id: string;
  name: string;
  userName: string;
  imgUrl?: string;
};

type TourResult = {
  _id: string;
  userId: string;
  imgUrls: string[];
  caption: string;
  location: string;
  tags: string[];
  createdAt: Date;
};

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
  try {
    try {
      await verifyToken();
    } catch {
      return NextResponse.json(
        { success: false, msg: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();
    const searchParams = req.nextUrl.searchParams;

    const userName = searchParams.get("userName");
    const location = searchParams.get("location");

    if (!userName && !location) {
      return NextResponse.json(
        {
          success: false,
          msg: "UserName or location is required",
        },
        { status: 400 },
      );
    }

    let data: UserResult[] | TourResult[] = [];

    if (userName) {
      const safePattern = escapeRegex(userName.trim());
      const users = await User.find(
        { userName: { $regex: safePattern, $options: "i" } },
        { name: 1, userName: 1, imgUrl: 1 },
      ).lean();

      data = users.map((item) => ({
        _id: item._id.toString(),
        name: item.name,
        userName: item.userName,
        imgUrl: item.imgUrl ?? "",
      }));
    } else if (location) {
      const safePattern = escapeRegex(location.trim());
      const tours = await Tour.find({
        location: { $regex: safePattern, $options: "i" },
        visibility: "public",
      }).lean();

      data = tours.map((item) => ({
        _id: item._id.toString(),
        userId: item.userId.toString(),
        imgUrls: item.imgUrls,
        caption: item.caption,
        location: item.location,
        tags: item.tags,
        createdAt: item.createdAt,
      }));
    }

    return NextResponse.json(
      {
        success: true,
        isUsersData: !!userName,
        data,
        msg: "Fetched data successfully",
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error in search route";
    return NextResponse.json(
      {
        success: false,
        msg: "Error in search route",
        error: message,
      },
      { status: 500 },
    );
  }
}