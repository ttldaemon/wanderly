import { connectDB } from "@/lib/db";
import { Tour } from "@/models/tour";
import { User } from "@/models/user";
import { verifyToken } from "@/utils/helpers";
import { NextRequest, NextResponse } from "next/server";

type user = {
    _id: string;
    name: string;
    userName: string;
    imgUrl?: string;
}

type tour = {
    _id: string;
    userId: string;
    imgUrls: string[];
    caption: string;
    location: string;
    tags: string[];
    createdAt: Date;
}

// requires query params in format: /api/search?userName=someUserName or /api/search?location=someLocation
export async function GET(req: NextRequest) {
    try {
        await verifyToken();
        await connectDB()
        const searchParams = req.nextUrl.searchParams;

        const userName = searchParams.get("userName")
        const location = searchParams.get("location")

        if (!userName && !location) {
            return NextResponse.json({
                success: false,
                msg: "UserName or location is required"
            }, { status: 400 })
        }

        let data: user[] | tour[] = [];

        if (userName) {
            const users = await User.find(
                { userName: { $regex: userName, $options: "i" } },
                { name: 1, userName: 1, imgUrl: 1 } // you can remove this, since we are mapping the data to only include these fields, but this will reduce the amount of data sent from the database

                // you can also use select method instead of projection

            ).lean();  // lean method return the plain javascript object instead of mongoose document

            data = users.map((item) => ({
                _id: item._id.toString(),
                name: item.name,
                userName: item.userName,
                imgUrl: item.imgUrl ?? "",
            }));
        } else if (location) {
            const tours = await Tour.find(
                { location: { $regex: location, $options: "i" } }
            ).lean();

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

        // console.log(data)


        return NextResponse.json({
            success: true,
            isUsersData: !!userName, // based on the value, the data needs to be displayed on middle col or right column
            data,
            msg: "Fetched data successfully"
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            success: false,
            msg: "Error in search route",
            error: error
        }, { status: 500 })
    }
}