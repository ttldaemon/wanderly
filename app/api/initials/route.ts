import { connectDB } from "@/lib/db";
import { Tour } from "@/models/tour";
import { User } from "@/models/user";
import { verifyToken } from "@/utils/helpers";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// the initial fetch for the user, some random recommended users profile and some recommended tours
export async function GET(req: NextRequest) {
    try {
        await connectDB()
        const decoded = await verifyToken()

        if (!decoded) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const userId = new Types.ObjectId(decoded._id);

        console.log(userId)

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }
                }
            },
            {
                $sample: { size: 7 }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    userName: 1,
                    imgUrl: 1
                }
            }
        ])

        const tours = await Tour.aggregate([
            {
                $match: {
                    userId: { $ne: userId },
                    visibility: "public"
                }
            },
            {
                $sample: { size: 20 }
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    imgUrls: 1,
                    caption: 1,
                    location: 1,
                    tags: 1,
                    createdAt: 1
                }
            }
        ])

        console.log(users)
        console.log(tours)

        return NextResponse.json({ success: true, msg: "Initial data fetched successfully", users, tours }, { status: 200 })

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 })
    }

}