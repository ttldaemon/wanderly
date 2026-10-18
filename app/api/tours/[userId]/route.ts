import { connectDB } from "@/lib/db";
import { Tour } from "@/models/tour";
import { verifyToken } from "@/utils/helpers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/mini";

interface Params {
  userId: string;
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
  { params }: { params: Promise<Params> },
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
        msg: "Internal server error",
        error: message,
      },
      { status: 500 },
    );
  }
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<Params> },
) {
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
    const { userId } = await params;
    const tours = await Tour.find({ userId });

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
