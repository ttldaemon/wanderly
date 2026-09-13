import { connectDB } from "@/lib/db";
import { Tour } from "@/models/tour";
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

    const newTour = Tour.create({
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
      },
      { status: 500 },
    );
  }
}
