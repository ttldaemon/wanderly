import { connectDB } from "@/lib/db";
import { Wandy } from "@/models/wandy";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/mini";

interface Params {
  userId: string;
}

const postWanderSchema = z.object({
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
  const parsedBody = postWanderSchema.safeParse(body);

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

    const newWandy = Wandy.create({
      userId,
      imgUrls,
      caption,
      location,
      tags,
      visibility,
    });

    if (!newWandy) {
      return NextResponse.json(
        {
          success: false,
          msg: "Wandy creation failed",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        msg: "Wandy created successfully",
        data: newWandy,
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
