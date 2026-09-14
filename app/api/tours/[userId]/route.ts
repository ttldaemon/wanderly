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


// create a new tour for a user
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  await verifyToken()
  const body = await req.json();
  const { userId } = await params;

  // posting a new wander
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

  try {
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
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        msg: "Internal server error",
        error: error.message,
      },
      { status: 500 },
    );
  }
}


// get all the posts of a user, based on the userId passed in the params
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<Params> },
) {
  try {
    await verifyToken();
    await connectDB();
    const { userId } = await params;

    console.log(userId);

    const tours = await Tour.find({ userId });

    console.log(tours);

    return NextResponse.json(
      {
        success: true,
        msg: "Tours of the user",
        tours,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        msg: "Something went wrong",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
