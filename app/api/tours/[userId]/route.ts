import { connectDB } from "@/lib/db";
import { Tour } from "@/models/tour";
import { verifyToken } from "@/utils/helpers";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/mini";

interface Params {
  params: Promise<{userId: string}>
}

interface GetMatchCondition {
  userId: Types.ObjectId;
  visibility?: "public" | "private";
}

const postTourSchema = z.object({
  imgUrls: z.array(z.string()),
  caption: z.string(),
  location: z.string(),
  tags: z.array(z.string()),
  visibility: z.enum(["public", "private"]),
});

export async function POST(
  req: NextRequest,
  { params }: Params,
) {
  try {
    let decoded;
    try {
      decoded = await verifyToken();
    } catch {
      return NextResponse.json(
        { success: false, msg: "Unauthorized" },
        { status: 401 },
      );
    }

    const { userId } = await params;

    if (decoded._id !== userId) {
      return NextResponse.json(
        { success: false, msg: "Forbidden" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const parsedBody = postTourSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          success: false,
          msg: parsedBody.error,
        },
        { status: 400 },
      );
    }

    const { imgUrls, caption, location, tags, visibility } = parsedBody.data;

    await connectDB();

    const newTour = await Tour.create({
      userId,
      imgUrls,
      caption,
      location,
      tags,
      visibility,
    });

    if (!newTour) {
      return NextResponse.json(
        {
          success: false,
          msg: "Tour creation failed",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        msg: "Tour created successfully",
        data: newTour,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        msg: message,
      },
      { status: 500 },
    );
  }
}

export async function GET(
  _: NextRequest,
  { params }: Params,
) {
  try {
    let decoded;
    try {
      decoded = await verifyToken();
    } catch {
      return NextResponse.json(
        { success: false, msg: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();
    const { userId } = await params;

    const isOwnProfile = decoded._id === userId;

    const matchCondition: GetMatchCondition = {
      userId: new Types.ObjectId(userId),
    };

    if (!isOwnProfile) { // if we are searching for other profile tours then only the public one will be searched otherwise if user's own posts are searched then visibility criteria will not be applied
      matchCondition.visibility = "public"; 
    }

    const tours = await Tour.aggregate([
      {
        $match: matchCondition,
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
          visibility: 1,
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
          visibility: 1,
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

    return NextResponse.json(
      {
        success: true,
        msg: "Tours of the user",
        tours,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json(
      {
        success: false,
        msg: "Something went wrong",
        error: message,
      },
      { status: 500 },
    );
  }
}


export async function DELETE(
  req: NextRequest,
   { params }: Params,
) {
  try {
    await connectDB();

    const authData = await verifyToken();
    const { userId } = await params;

    if (authData._id !== userId) {
      return NextResponse.json(
        { success: false, msg: "Forbidden" },
        { status: 403 },
      );
    }

    // tourId of the tour passed as parameters of the url 
    const tourId = req.nextUrl.searchParams.get("tourId");

    if (!tourId || !Types.ObjectId.isValid(tourId)) {
      return NextResponse.json(
        { success: false, msg: "Invalid tour ID" },
        { status: 400 },
      );
    }

    const deletedTour = await Tour.findOneAndDelete({
      _id: tourId,
      userId,
    });

    if (!deletedTour) {
      return NextResponse.json(
        { success: false, msg: "Tour not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Tour deleted successfully" },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";

    return NextResponse.json(
      { success: false, msg: message},
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: Params,
) {
  try {
    await connectDB();

    const authData = await verifyToken();
    const { userId } = await params;

    if (authData._id !== userId) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const { tourId, ...body } = await req.json();

    console.log(body)

    const updatedTour = await Tour.findByIdAndUpdate(
      tourId,
      { $set: body },
      { returnDocument: "after" },
    ).lean();

    if (!updatedTour) {
      return NextResponse.json(
        { success: false, message: "Tour not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, tour: updatedTour },
      { status: 200 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";

    return NextResponse.json(
      { success: false, message },
      { status: 500 },
    );
  }
}